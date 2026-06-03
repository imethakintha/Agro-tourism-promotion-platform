import os
import sys
import numpy as np
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from sklearn.cluster import DBSCAN
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from google import genai
from google.genai import types


load_dotenv(dotenv_path='../server/.env')

app = FastAPI(title="AgroLK AI Engine", description="AI Microservice for AgroLK (Recommendation, Trip Planning, RAG, Smart pricing Assistant)")

origins = ["*"]  
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def serialize_doc(doc):
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        return {k: (str(v) if isinstance(v, ObjectId) else serialize_doc(v)) for k, v in doc.items()}
    return doc

# Initialize Models
try:
    client_ai = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))
    print("AI Models Initialized")
except Exception as e:
    print(f"AI Model Init Error: {e}")

mongo_uri = os.getenv('MONGO_URI')
db_name = 'agrolk-FinalYP'
vector_collection_name = 'agro_vectors'

try:
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client[db_name]
    vector_collection = db[vector_collection_name]
    print(f"Connected to MongoDB: {db_name}")
except Exception as e:
    print(f"MongoDB Connection Error: {e}")

class PricingRequest(BaseModel):
    categoryId: str
    tagIds: List[str]
    currentPrice: Optional[float] = 0.0

class RecommendRequest(BaseModel):
    userId: Optional[str] = None
    country: str = 'Sri Lanka'

class LanguagePredictRequest(BaseModel):
    lat: float
    lng: float
    language: str = 'English'

class TripRequest(BaseModel):
    userId: Optional[str] = None
    startDate: str
    endDate: str
    interests: List[str]
    pace: str = 'Moderate'
    luxury: bool = False
    needTransport: bool = False
    needGuide: bool = False
    pickupLocation: Optional[Any] = None
    participantCount: int = 1
    groupType: Optional[str] = None

class WisdomRequest(BaseModel):
    query: str
    userId: Optional[str] = None


# --- ROUTES ---

@app.post("/predict-price")
def predict_smart_price(request: PricingRequest):
    try:
        print(f"Calculating Smart Price for Category: {request.categoryId}")

        query = {
            'status': 'Active',
            '$or': [
                {'categoryId': ObjectId(request.categoryId)},
                {'tagIds': {'$in': [ObjectId(tid) for tid in request.tagIds]}}
            ]
        }
        
        similar_activities = list(db.activities.find(query))

        if not similar_activities or len(similar_activities) < 3:
            return {
                'success': True,
                'suggestedPrice': request.currentPrice if request.currentPrice > 0 else 1500,
                'minPrice': 1000,
                'maxPrice': 2000,
                'reasoning': "Insufficient market data. Showing base price.",
                'confidence': "Low"
            }

        prices = []
        bookings_count = []
        ratings = []

        current_month = datetime.now().month
        is_peak_season = 1 if current_month in [12, 1, 2, 7, 8] else 0
        
        total_demand = 0
        
        for act in similar_activities:
            b_count = db.bookings.count_documents({
                'activityId': act['_id'],
                'status': 'Completed'
            })
            
            p = act.get('pricePerPerson', 0)
            if p > 0:
                prices.append(p)
                bookings_count.append(b_count)
                ratings.append(act.get('averageRating', 0))
                total_demand += b_count

        avg_market_price = np.mean(prices)
        avg_demand = np.mean(bookings_count) if bookings_count else 0

        suggested_price = avg_market_price
        method = "Market Average"

        if len(prices) >= 5:

            X = pd.DataFrame({
                'bookings': bookings_count,
                'rating': ratings,
                'is_peak': [is_peak_season] * len(prices)
            })
            y = np.array(prices)
            
            model = LinearRegression()
            model.fit(X, y)

            target_bookings = avg_demand * 1.2
            target_rating = 4.5
            
            input_df = pd.DataFrame({
                'bookings': [target_bookings],
                'rating': [target_rating],
                'is_peak': [is_peak_season]
            })
            
            prediction = model.predict(input_df)
            suggested_price = prediction[0]
            method = "Linear Regression Model"
        
        else:
            season_factor = 0.15 if is_peak_season else 0.0
            demand_factor = 0.10 if total_demand > 10 else 0.0
            
            suggested_price = avg_market_price * (1 + season_factor + demand_factor)
            method = "Market Demand Analysis"

        suggested_price = round(suggested_price / 50) * 50

        reason = []
        if is_peak_season: reason.append("Peak holiday season detected (+15%).")
        if total_demand > 20: reason.append("High market demand in this category.")
        else: reason.append("Market demand is moderate.")
        reason.append(f"Based on {len(similar_activities)} similar local activities.")

        return {
            'success': True,
            'suggestedPrice': max(500, suggested_price),
            'minPrice': min(prices) if prices else 500,
            'maxPrice': max(prices) if prices else 3000,
            'marketAvg': round(avg_market_price, 2),
            'method': method,
            'reasoning': " ".join(reason)
        }

    except Exception as e:
        print(f"Error in /predict-price: {e}")
        return {'success': False, 'message': str(e)}

@app.get("/")
def read_root():
    return {"message": "AgroLK AI Engine is Running"}


# --- 1. Recommendation Engine

@app.post("/recommend")
def recommend_activities(request: RecommendRequest):
    try:
        user_id = request.userId
        user_country = request.country
        
        print(f"🚀 Generating Dynamic Recommendations for Country: {user_country}")
        
        similar_users_cursor = db.users.find({
            'countryOfResidence': user_country, 
            'role': 'Tourist'
        })
        similar_user_ids = [u['_id'] for u in similar_users_cursor]

        tag_scores = {}      
        category_scores = {} 
        booking_count = 0

        if similar_user_ids:
            past_bookings = db.bookings.find({
                'touristId': {'$in': similar_user_ids},
                'status': {'$in': ['Confirmed', 'Completed']}
            })
            
            for booking in past_bookings:
                booking_count += 1
                activity = db.activities.find_one({'_id': booking['activityId']})
                
                if activity:
                    cat_id = str(activity.get('categoryId'))
                    if cat_id:
                        category_scores[cat_id] = category_scores.get(cat_id, 0) + 1.0
                    
                    for tag_id in activity.get('tagIds', []):
                        t_id = str(tag_id)
                        tag_scores[t_id] = tag_scores.get(t_id, 0) + 2.0

        print(f"📊 Analyzed {booking_count} past bookings from {len(similar_user_ids)} tourists in {user_country}")

        activities_cursor = db.activities.find({'status': 'Active'})
        all_activities = list(activities_cursor)
        scored_activities = []

        has_dynamic_data = bool(tag_scores or category_scores)

        if has_dynamic_data:
            print("💡 Using Data-Driven Dynamic Profiling")
            
            max_tag_score = max(tag_scores.values()) if tag_scores else 1
            max_cat_score = max(category_scores.values()) if category_scores else 1

            for activity in all_activities:
                score = 0.0
                reasons = []

                act_cat_id = str(activity.get('categoryId'))
                if act_cat_id in category_scores:
                    cat_contribution = (category_scores[act_cat_id] / max_cat_score) * 1.0
                    score += cat_contribution
                    reasons.append("Category Match")

                act_tags = [str(t) for t in activity.get('tagIds', [])]
                for t_id in act_tags:
                    if t_id in tag_scores:
                        tag_contribution = (tag_scores[t_id] / max_tag_score) * 2.0
                        score += tag_contribution
                        reasons.append("Tag Match")
                
                rating = activity.get('averageRating', 0)
                score += (rating / 5.0) * 0.5

                if score > 0:
                    scored_activities.append({
                        'id': str(activity['_id']),
                        'title': activity.get('customTitle'),
                        'raw_score': score, 
                        'score': score,    
                        'reason': f"Popular in {user_country}",
                        'match_type': 'Dynamic',
                        'pricePerPerson': activity.get('pricePerPerson'),
                        'images': activity.get('images', [])
                    })

        else:

            print("⚠️ No history found. Using Cold-Start Hardcoded Logic.")
            
            culture_weights = {
                'France': ['Tea Plucking Experience', 'Spice Garden Tour', 'Traditional Pottery', 'Mud House Stay', 'Eco-Lodge'],
                'Germany': ['Ayurvedic Plant Picking', 'Meditation Retreat', 'Waterfall Hiking', 'Bird Watching', 'Mud House Stay'],
                'China': ['Seafood', 'Freshwater Fishing', 'Macro Photography Walk', 'Tea Plucking Experience', 'Lotus Flower Picking'],
                'Japan': ['Traditional Cooking Class', 'Tea Plucking Experience', 'Meditation in Nature', 'Organic Mask Carving'],
                'India': ['Spice Garden Tour', 'Ayurvedic Plant Picking', 'Traditional Oil Making', 'Herbal Bath Prep'],
                'Australia': ['Camping at Farm', 'Waterfall Hiking', 'Night Safari', 'Traditional Stilt Fishing'],
                'America': ['Traditional Cooking Class', 'Leopard Scouting', 'Cinnamon Peeling', 'Village Life'],
                'Korea': ['Macro Photography Walk', 'Tea Plucking Experience', 'Strawberry', 'Visual Arts'],
                'Russia': ['Night Safari', 'Camping at Farm', 'Waterfall Hiking', 'Arrack'],
                'Netherlands': ['Paddy Harvesting', 'Cycling', 'Traditional Pottery', 'Buffalo Curd Making'],
                'USA': ['Camping at Farm', 'Waterfall Hiking', 'Night Safari', 'Traditional Stilt Fishing'],
                'Italy': ['Traditional Cooking Class', 'Leopard Scouting', 'Cinnamon Peeling', 'Fruit Tasting'],
                'Canada': ['Night Safari', 'Leopard Scouting', 'Bird Watching', 'Bee Keeping'],
                'Switzerland': ['Traditional Cooking Class', 'Traditional Farm Pottery', 'Traditional Shepherding', 'Village Life'],
            }
            
            preferred_keywords = culture_weights.get(user_country, [])
            
            for activity in all_activities:
                score = 0.5 
                text_content = (activity.get('customTitle', '') + " " + activity.get('customDescription', '')).lower()
                
                matches = []
                for keyword in preferred_keywords:
                    if keyword.lower() in text_content:
                        score += 0.3 
                        matches.append(keyword)

                if score > 0.6: 
                    scored_activities.append({
                        'id': str(activity['_id']),
                        'title': activity.get('customTitle'),
                        'raw_score': score,
                        'score': score,
                        'reason': f"Trending in {user_country}" if matches else "Recommended",
                        'match_type': 'Static',
                        'pricePerPerson': activity.get('pricePerPerson'),
                        'images': activity.get('images', [])
                    })

        
        if scored_activities:
            max_score_found = max(item['score'] for item in scored_activities)
            
            if max_score_found > 0:
                for item in scored_activities:
                    normalized_score = item['score'] / max_score_found
                    
                    item['score'] = round(normalized_score, 2)
        
        scored_activities.sort(key=lambda x: x['score'], reverse=True)
        
        return serialize_doc({
            'success': True,
            'source': 'Dynamic' if has_dynamic_data else 'Static',
            'recommendations': scored_activities[:5]
        })

    except Exception as e:
        print(f"Error in /recommend: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- 2. Language Availability Predictor ---

@app.post("/predict-language")
def predict_language(request: LanguagePredictRequest):
    try:
        lat = request.lat
        lng = request.lng
        language = request.language

        print(f"\n🔮 Predicting {language} guides near [{lat}, {lng}]")

        try:
            nearby_guides = list(db.tourguides.find({
                'location': {
                    '$near': {
                        '$geometry': { 'type': "Point", 'coordinates': [float(lng), float(lat)] },
                        '$maxDistance': 20000 
                    }
                },
                'verificationStatus': 'Approved',
                'isActive': True
            }))
        except Exception as db_err:
            print(f"⚠️ GeoQuery Failed: {db_err}")
            return {'success': False, 'badge': None}

        total_guides = len(nearby_guides)
        
        if total_guides == 0:
            return {'success': True, 'badge': None}

        matching_guides = 0
        for g in nearby_guides:
            langs = [l.lower() for l in g.get('languagesSpoken', [])]
            if language.lower() in langs:
                matching_guides += 1
        
        badge = None
        if matching_guides > 0:
            prob = (matching_guides / total_guides) * 100
            
            if prob > 50 or matching_guides >= 2:
                badge = { 'text': f'High Chance of {language} Guide', 'color': 'green' }
            else:
                badge = { 'text': f'{language} Guides Limited', 'color': 'yellow' }
        
        return {
            'success': True,
            'total_nearby': total_guides,
            'matching': matching_guides,
            'badge': badge
        }

    except Exception as e:
        print(f"Error in /predict-language: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- 3. AgroLK Wisdom Hub (RAG Implementation) ---

@app.post("/api/ai/agro-guide")
def agro_guide(request: WisdomRequest):
    try:
        query = request.query
        print(f"🧠 MongoDB Vector Search Query: {query}")

        try:
            emb_result = client_ai.models.embed_content(
                model="models/text-embedding-004",
                contents=query,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
            )
            query_embedding = emb_result.embeddings[0].values
        except Exception as e:
            print(f"Embedding Error: {e}")
            raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

        pipeline = [
            {
                "$vectorSearch": {
                    "index": "default", 
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": 5
                }
            },
            {
                "$project": {
                    "text": 1,
                    "metadata": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]

        results = list(vector_collection.aggregate(pipeline))

        context_text = ""
        sources = []
        
        if results:
            context_text = "\n\n".join([doc.get('text', '') for doc in results])
            sources = list(set([doc.get('metadata', {}).get('source', 'Unknown') for doc in results]))

        system_instruction = """### ROLE
You are "AgroLK AI," a premium, empathetic, and highly knowledgeable Agricultural Advisor specializing in Sri Lankan farming and agro-tourism. Your goal is to bridge the gap between traditional wisdom and modern technology for both local farmers and international visitors.

### RESPONSE GUIDELINES
1.  **Structure & Scannability:** - Use clear **Headings** (###) to separate ideas.
    - Use **Bullet points** for instructions or lists.
    - Use **Bold text** to highlight key terms, crops, or locations.
    - Keep paragraphs short (2-3 sentences max).

2.  **Tone & Style:**
    - Be warm, professional, and welcoming (reflecting Sri Lankan hospitality).
    - Use practical, easy-to-understand language. Avoid heavy jargon unless explaining it.
    - Tailor advice to the persona: Provide technical depth for **Farmers** and experiential/cultural context for **Tourists**.

3.  **Grounded Knowledge (RAG Logic):**
    - **IF FOUND IN CONTEXT:** Synthesize the information into a helpful summary. Always cite the source at the end of the relevant section or the response (e.g., *Source: [Department of Agriculture, SL]*).
    - **IF NOT FOUND IN CONTEXT:** Use this specific transition: "While our primary knowledge hub doesn't have a specific record of this, here is some general agricultural guidance based on Sri Lankan standards..." 
    - Always recommend consulting a local agrarian officer or the "1920" agri-hotline for critical farming decisions.

4.  **Formatting for UX:**
    - Use emojis sparingly to add a friendly touch (e.g., 🌿 for plants, 📍 for locations).
    - End every response with a helpful follow-up question to keep the user engaged.

### TASK
Analyze the provided Context and the User Query. Deliver a response that is visually organized, factually accurate, and culturally relevant to the Sri Lankan agricultural landscape."""

        prompt = f"Context Information:\n{context_text}\n\nUser Question: {query}"

        response = client_ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )
        )
        
        return {
            "success": True,
            "response": response.text,
            "sources": sources
        }

    except Exception as e:
        print(f"❌ Wisdom Hub Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- Helper: Activity Availability ---
def is_activity_available(activity, target_date, participant_count=1):
    calendar = activity.get('availabilityCalendar', [])
    if not calendar: return True 
    
    target_day_name = target_date.strftime('%A')
    date_obj_check = target_date.date()
    
    for slot in calendar:
        slot_date_val = slot.get('date')
        is_date_match = False
        
        if slot_date_val:
            if isinstance(slot_date_val, datetime): s_d = slot_date_val.date()
            elif isinstance(slot_date_val, str):
                try: s_d = datetime.strptime(slot_date_val[:10], '%Y-%m-%d').date()
                except: continue
            else: continue    
            if s_d == date_obj_check: is_date_match = True

        if not is_date_match:
            start, end = slot.get('startDate'), slot.get('endDate')
            if start and end:
                try:
                    s = start.date() if isinstance(start, datetime) else datetime.strptime(str(start)[:10], '%Y-%m-%d').date()
                    e = end.date() if isinstance(end, datetime) else datetime.strptime(str(end)[:10], '%Y-%m-%d').date()
                    if s <= date_obj_check <= e: is_date_match = True
                except: pass
        
        if not is_date_match: continue

        days = slot.get('daysOfWeek', [])
        if days and target_day_name not in days: continue

        time_slots = slot.get('timeSlots', [])
        if not time_slots: return True
            
        for ts in time_slots:
            if int(ts.get('availableSlots', 0)) >= participant_count and ts.get('status', 'Available') == 'Available':
                return True

    return False 


# --- 4. Trip Planner ---

@app.post("/generate-trip")
def generate_trip(request: TripRequest):
    try:
        print(f"🚀 Generating Trip for: {request}")
        
        try:
            start_str = request.startDate.split('T')[0]
            end_str = request.endDate.split('T')[0]
            
            start_date = datetime.strptime(start_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_str, '%Y-%m-%d')
        except Exception as e:
            return {'success': False, 'message': f'Invalid date format: {e}'}
             
        duration_days = (end_date - start_date).days + 1
        if duration_days <= 0:
             return {'success': False, 'message': 'End date must be after start date.'}

        # --- 2. FETCH DATA ---
        farms = list(db.farms.find({'isActive': True, 'verificationStatus': 'Approved'}))
        activities = list(db.activities.find({'status': 'Active'}))
        all_tags = list(db.activitytags.find({}))
        all_categories = list(db.activitycategories.find({}))
        
        farm_map = {str(f['_id']): f for f in farms}
        tag_name_map = {str(t['_id']): t.get('tagName', '').lower() for t in all_tags}

        cat_name_to_id = {c.get('categoryName', '').strip().lower(): str(c['_id']) for c in all_categories}
        
        INTEREST_CATEGORY_MAP = {
            'Plantation': ['Plantation Heritage', 'Spice & Wellness'], 
            'Village': ['Village Life & Organic'], 
            'Culinary': ['Farm-to-Table Culinary'], 
            'Adventure': ['Eco-Adventure & Wildlife'],
            'Coastal': ['Coastal & Aqua Farming'],
            'Wellness': ['Holistic Wellness & Serenity', 'Spice & Wellness'], 
            'Arts': ['Visual Arts & Photography', 'Eco-Artisan & Farm-Based Crafts'], 
            'Animal': ['Ethical Animal Interaction & Pastoral Life', 'Eco-Adventure & Wildlife']
        }

        # --- 4. DYNAMIC TAG EXTRACTION ---
        dynamic_keywords = set()
        selected_cat_ids = []

        for interest_key in request.interests:
            db_cat_names = INTEREST_CATEGORY_MAP.get(interest_key, [])
            
            for cat_name in db_cat_names:
                cat_id = cat_name_to_id.get(cat_name.lower())
                if cat_id:
                    selected_cat_ids.append(cat_id)
                    dynamic_keywords.add(cat_name.lower())

        for act in activities:
            act_cat_id = str(act.get('categoryId'))
            
            if act_cat_id in selected_cat_ids:
                if 'tagIds' in act and isinstance(act['tagIds'], list):
                    for tag_id in act['tagIds']:
                        t_name = tag_name_map.get(str(tag_id))
                        if t_name:
                            dynamic_keywords.add(t_name) 

        print(f"💡 Mapped Categories: {len(selected_cat_ids)} | Dynamic Keywords: {list(dynamic_keywords)[:10]}...")

        # --- 5. SCORING ENGINE (Same as before but using new keywords) ---
        scored_items = []
        for act in activities:
            farm = farm_map.get(str(act['farmId']))
            if not farm: continue
            
            # Check Availability
            is_ever_available = False
            for d in range(duration_days):
                if is_activity_available(act, start_date + timedelta(days=d), request.participantCount):
                    is_ever_available = True
                    break
            if not is_ever_available: continue

            score = 1.0
            text_content = (act.get('customTitle', '') + " " + act.get('customDescription', '')).lower()
            
            # Prepare Activity Tags
            act_tags_list = []
            if 'tagIds' in act:
                for tid in act['tagIds']:
                    tname = tag_name_map.get(str(tid))
                    if tname: act_tags_list.append(tname)

            matches = []

            for keyword in dynamic_keywords:
                if keyword in act_tags_list:
                    matches.append(keyword)
                    score += 2.0
                elif keyword in text_content:
                    matches.append(keyword)
                    score += 1.0
            
            # Category Match Bonus
            act_cat_id = str(act.get('categoryId'))
            if act_cat_id in selected_cat_ids:
                score += 3.0
            
            if farm.get('verificationStatus') == 'Approved': score += 0.5
            if act.get('averageRating', 0) > 4.5: score += 0.5
            
            if score > 1.5: 
                scored_items.append({
                    'activity': act,
                    'farm': farm,
                    'score': score,
                    'matches': list(set(matches)),
                    'coords': farm['location']['coordinates']
                })

        scored_items.sort(key=lambda x: x['score'], reverse=True)
        
        if not scored_items:
             return {'success': False, 'message': 'No matching activities found. Try selecting more interests.'}

        # --- 6. CLUSTERING & ROUTING (DBSCAN) ---
        coords_list = [c['coords'] for c in scored_items]
        
        try:
            clustering = DBSCAN(eps=0.2, min_samples=1).fit(coords_list)
        except:
             return {'success': False, 'message': 'Route optimization failed.'}
        
        clusters = {}
        for idx, label in enumerate(clustering.labels_):
            if label not in clusters: clusters[label] = []
            clusters[label].append(scored_items[idx])
            
        cluster_list = []
        for label, items in clusters.items():
            if label == -1 and len(clusters) > 1: continue
            cluster_list.append({'items': items, 'total_score': sum(i['score'] for i in items)})
            
        curr_ref = [79.8612, 6.9271] 
        ordered_clusters = []
        
        while cluster_list:
            cluster_list.sort(key=lambda c: ((np.mean([x['coords'][0] for x in c['items']]) - curr_ref[0])**2 + 
                                             (np.mean([x['coords'][1] for x in c['items']]) - curr_ref[1])**2), reverse=False)
            selected = cluster_list.pop(0)
            ordered_clusters.append(selected['items'])
            s_coords = [item['coords'] for item in selected['items']]
            curr_ref = [np.mean([x[0] for x in s_coords]), np.mean([x[1] for x in s_coords])]

        itinerary = []
        total_price = 0
        total_dist = 0
        current_loc = [79.8612, 6.9271]
        used_farm_ids = set() 
        
        for day_num in range(duration_days):
            current_date = start_date + timedelta(days=day_num)

            cluster_activities = ordered_clusters[day_num % len(ordered_clusters)] if ordered_clusters else []
            
            daily_plan = {'date': current_date.strftime('%Y-%m-%d'), 'activities': []}
            prev_coords = current_loc
            
            for slot in ['Morning', 'Afternoon']:
                candidate = None
                for item in cluster_activities:
                    fid = str(item['farm']['_id'])
                    if fid in used_farm_ids and len(used_farm_ids) < len(scored_items): continue 
                    
                    if is_activity_available(item['activity'], current_date, request.participantCount):
                        candidate = item
                        break

                if not candidate:
                     for item in scored_items:
                          fid = str(item['farm']['_id'])
                          if fid not in used_farm_ids:
                               if is_activity_available(item['activity'], current_date, request.participantCount):
                                   candidate = item
                                   break

                if candidate:
                    used_farm_ids.add(str(candidate['farm']['_id']))
                    pps = candidate['activity'].get('pricePerPerson', 0) or 0
                    price = pps * request.participantCount
                    
                    curr_c = candidate['coords']
                    dist_km = ((curr_c[0] - prev_coords[0])**2 + (curr_c[1] - prev_coords[1])**2)**0.5 * 111
                    
                    img_url = ""
                    if candidate['activity'].get('images') and len(candidate['activity']['images']) > 0:
                        img_url = candidate['activity']['images'][0].get('url', '')

                    daily_plan['activities'].append({
                        'time': slot,
                        'title': candidate['activity']['customTitle'],
                        'price': price,
                        'location': candidate['farm']['location'].get('city', 'Unknown'),
                        'coords': curr_c,
                        'image': img_url,
                        'travelInfo': {'distanceKm': round(dist_km, 1)}
                    })
                    total_price += price
                    total_dist += dist_km
                    prev_coords = curr_c
            
            itinerary.append(daily_plan)
            if daily_plan['activities']:
                current_loc = daily_plan['activities'][-1]['coords']
        
        transport_cost = 0
        if request.needTransport:
             transport_cost = round(total_dist * 100)


        guide_cost = 0
        if request.needGuide:
             guide_cost = duration_days * 3500

        final_total_price = total_price + transport_cost + guide_cost

        return {
            'success': True,
            'itinerary': itinerary,
            'total_price': final_total_price,
            'breakdown': {
                'distance_km': round(total_dist),
                'participantCount': request.participantCount,
                'activities': len(used_farm_ids),
                'transport': transport_cost,
                'guide': guide_cost
            }
        }

    except Exception as e:
        print(f"❌ Error in /generate-trip: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
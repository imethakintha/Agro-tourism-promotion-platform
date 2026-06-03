import mongoose from 'mongoose';

const plantInfoSchema = new mongoose.Schema({
  commonName: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    trim: true
  }, 
  
  scientificName: { 
    type: String,
    trim: true
  },
  family: { 
    type: String,
    trim: true
  },

  localNames: {
    sinhala: String,
    tamil: String
  },
  
  touristInfo: {
    quickDescription: String,
    medicinalValue: String,
    usage: String 
  },
  
  farmerInfo: {
    commonPestsText: String, 
    marketTips: String,
    cultivationTips: String,
    seasonality: String
  },

  generalCare: {
    watering: String,
    sunlight: String,
    soil: String
  },
  
  commonDiseases: [{
    name: String,
    symptoms: String,
    solution: String
  }],
 
  relatedTags: [String] 
}, {
  timestamps: true
});

plantInfoSchema.index({ commonName: 'text', scientificName: 'text', family: 'text', 'localNames.sinhala': 'text', 'localNames.tamil': 'text' });

export default mongoose.model('PlantInfo', plantInfoSchema);
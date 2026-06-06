import React from 'react';

interface BookingStatusBadgeProps {
  status: string;
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';

  switch (status) {
    case 'Confirmed':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'Pending':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Cancelled':
    case 'Declined':
      colorClass = 'bg-red-100 text-red-800';
      break;
    case 'Completed':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

export default BookingStatusBadge;
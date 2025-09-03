type Props = {
  title: string;
  price: string;
  image: string;
  rating?: number;
};

export default function ProductCard({ title, price, image, rating = 5 }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <div className="flex items-center justify-between mt-2">
          <div className="text-royal-purple font-bold">{price}</div>
          <div className="text-sm text-gray-500">{rating} ★</div>
        </div>
      </div>
    </div>
  );
}

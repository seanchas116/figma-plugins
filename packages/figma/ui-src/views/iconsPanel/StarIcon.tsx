import { Icon } from "@iconify/react";

export const StarIcon: React.FC<{
  value: boolean;
  onChangeValue: (value: boolean) => void;
}> = ({ value, onChangeValue }) => {
  return (
    <button
      className="p-1 -m-1"
      onClick={(e) => {
        e.stopPropagation();
        onChangeValue(!value);
      }}
    >
      {value ? (
        <Icon
          icon="material-symbols:star"
          className="w-4 h-4 text-yellow-500 hover:scale-125"
        />
      ) : (
        <Icon
          icon="material-symbols:star-outline"
          className="w-4 h-4 opacity-0 group-hover:opacity-100 text-gray-300 hover:scale-125"
        />
      )}
    </button>
  );
};

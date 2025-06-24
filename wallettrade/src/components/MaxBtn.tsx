"use client";

type MaxBtnProps = {
  onMaxPress: () => void;
};

const MaxBtn = ({ onMaxPress }: MaxBtnProps) => {
  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => onMaxPress()}
        className=" px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors cursor-pointer"
      >
        Max
      </button>
    </div>
  );
};

export default MaxBtn;

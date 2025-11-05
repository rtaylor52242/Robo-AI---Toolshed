
import React from 'react';

type InputProps = React.ComponentPropsWithRef<'input'>;

const Input: React.FC<InputProps> = (props) => {
  return (
    <input
      {...props}
      className={`w-full bg-gray-900/50 text-white px-4 py-2 border-2 border-gray-600 rounded-md focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors duration-300 ${props.className || ''}`}
    />
  );
};

export default Input;

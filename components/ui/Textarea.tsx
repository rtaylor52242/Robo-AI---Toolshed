
import React from 'react';

type TextareaProps = React.ComponentPropsWithRef<'textarea'>;

const Textarea: React.FC<TextareaProps> = (props) => {
  return (
    <textarea
      {...props}
      className={`w-full bg-gray-900/50 text-white px-4 py-2 border-2 border-gray-600 rounded-md focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors duration-300 resize-y ${props.className || ''}`}
    />
  );
};

export default Textarea;

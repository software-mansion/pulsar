import React from 'react';

interface TestProps {
  title?: string;
}

const Test: React.FC<TestProps> = ({ title = 'Test Component' }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>This is a simple example component.</p>
    </div>
  );
};

export default Test;
import React, { useState } from 'react';
import axios from 'axios';

function Pokedex() {
  const [message, setMessage] = useState('');

  const handleUpload = async (generation) => {
    try {
      const response = await axios.post(`/pokedex/save?gen=${generation}`);
      setMessage(response.data);
    } catch (error) {
      console.error(error);
      setMessage('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>포켓몬 도감 저장</h2>
      <button onClick={() => handleUpload(8)} style={{ margin: '10px' }}>
        8세대 저장
      </button>
      <button onClick={() => handleUpload(9)} style={{ margin: '10px' }}>
        9세대 저장
      </button>
      <div style={{ marginTop: '20px', color: 'green' }}>
        {message}
      </div>
    </div>
  );
}

export default Pokedex;
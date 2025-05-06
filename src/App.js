import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

// Local clothing store with metadata
const clothingStore = {
  shirts: [
    { 
      id: "shirt1", 
      name: "Basic T-Shirt", 
      objectName: "Wolf3D_Outfit_Top",
      thumbnail: "/api/placeholder/100/100",
      color: "#ff0000"
    },
    { 
      id: "shirt2", 
      name: "Formal Shirt", 
      objectName: "Wolf3D_Outfit_Top_2",
      thumbnail: "/api/placeholder/100/100",
      color: "#0000ff"
    },
    { 
      id: "shirt3", 
      name: "Hoodie", 
      objectName: "Wolf3D_Outfit_Top_3",
      thumbnail: "/api/placeholder/100/100",
      color: "#00ff00"
    },
    { 
      id: "shirt4", 
      name: "Tank Top", 
      objectName: "Wolf3D_Outfit_Top_4",
      thumbnail: "/api/placeholder/100/100",
      color: "#ffff00"
    }
  ],
  pants: [
    { 
      id: "pants1", 
      name: "Jeans", 
      objectName: "Wolf3D_Outfit_Bottom",
      thumbnail: "/api/placeholder/100/100",
      color: "#000080"
    },
    { 
      id: "pants2", 
      name: "Shorts", 
      objectName: "Wolf3D_Outfit_Bottom_2",
      thumbnail: "/api/placeholder/100/100",
      color: "#8B4513"
    }
  ]
};

function Avatar({ selectedShirt, selectedPants }) {
  const { scene } = useGLTF('https://models.readyplayer.me/6819bb571be966322d89faaa.glb');
  const avatarRef = useRef();
  
  // Find the selected clothing items
  const shirtItem = clothingStore.shirts.find(item => item.id === selectedShirt);
  const pantsItem = clothingStore.pants.find(item => item.id === selectedPants);
  
  useEffect(() => {
    if (!avatarRef.current) return;
    
    // Reset all clothing visibility first
    avatarRef.current.traverse((child) => {
      if (child.isMesh) {
        // Hide all clothing items first
        if (child.name.includes('Outfit_Top') || child.name.includes('Outfit_Bottom')) {
          child.visible = false;
        }
      }
    });
    
    // Then show only the selected items
    avatarRef.current.traverse((child) => {
      if (child.isMesh) {
        // Show selected shirt
        if (shirtItem && child.name.includes(shirtItem.objectName)) {
          child.visible = true;
          // Apply color to material
          if (child.material && shirtItem.color) {
            child.material.color.set(shirtItem.color);
          }
        }
        
        // Show selected pants
        if (pantsItem && child.name.includes(pantsItem.objectName)) {
          child.visible = true;
          // Apply color to material
          if (child.material && pantsItem.color) {
            child.material.color.set(pantsItem.color);
          }
        }
      }
    });
  }, [selectedShirt, selectedPants, shirtItem, pantsItem]);

  return <primitive ref={avatarRef} object={scene} position={[0, -1, 0]} scale={1.5} />;
}

function Scene({ selectedShirt, selectedPants }) {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Avatar selectedShirt={selectedShirt} selectedPants={selectedPants} />
      <OrbitControls />
    </>
  );
}

function ClothingSelector({ title, items, selectedItem, onSelect }) {
  return (
    <div className="clothing-selector">
      <h3>{title}</h3>
      <div className="items-grid">
        {items.map(item => (
          <div 
            key={item.id}
            className={`clothing-item ${selectedItem === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item.id)}
            style={{
              border: selectedItem === item.id ? '2px solid #000' : '1px solid #ccc',
              margin: '5px',
              padding: '5px',
              display: 'inline-block',
              cursor: 'pointer',
              backgroundColor: item.color,
              width: '80px',
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img src={item.thumbnail} alt={item.name} width="50" height="50" />
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#fff', textShadow: '1px 1px 1px #000' }}>
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [selectedShirt, setSelectedShirt] = useState(clothingStore.shirts[0].id);
  const [selectedPants, setSelectedPants] = useState(clothingStore.pants[0].id);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div className="canvas-container" style={{ flex: '2', height: '100%' }}>
        <Canvas style={{ height: '100%' }}>
          <Scene selectedShirt={selectedShirt} selectedPants={selectedPants} />
        </Canvas>
      </div>
      
      <div className="controls-panel" style={{ flex: '1', padding: '20px', backgroundColor: '#f5f5f5', overflow: 'auto' }}>
        <h2>Virtual Clothing Store</h2>
        
        <ClothingSelector 
          title="Shirts" 
          items={clothingStore.shirts} 
          selectedItem={selectedShirt} 
          onSelect={setSelectedShirt} 
        />
        
        <ClothingSelector 
          title="Pants" 
          items={clothingStore.pants} 
          selectedItem={selectedPants} 
          onSelect={setSelectedPants} 
        />

        <div className="info-panel" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0e0e0' }}>
          <h3>Selected Outfit</h3>
          <p>Shirt: {clothingStore.shirts.find(item => item.id === selectedShirt)?.name}</p>
          <p>Pants: {clothingStore.pants.find(item => item.id === selectedPants)?.name}</p>
        </div>
      </div>
    </div>
  );
}
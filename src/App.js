import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Local clothing store with metadata
const clothingStore = {
  shirts: [
    { 
      id: "shirt1", 
      name: "Basic T-Shirt", 
      type: "embedded", // Part of the avatar model
      objectName: "Wolf3D_Outfit_Top",
      thumbnail: "/api/placeholder/100/100",
      color: "#ff0000"
    },
    { 
      id: "shirt2", 
      name: "Formal Shirt", 
      type: "external", // External GLB file
      modelPath: "/hyde__jacket.glb",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      thumbnail: "/api/placeholder/100/100",
      color: "#0000ff"
    },
    { 
      id: "shirt3", 
      name: "Hoodie", 
      type: "external",
      modelPath: "/Untitled.glb",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      objectName: "/Untitled.glb",
      thumbnail: "/api/placeholder/100/100",
      color: "#00ff00"
    },
    { 
      id: "shirt4", 
      name: "Tank Top", 
      type: "embedded",
      objectName: "Wolf3D_Outfit_Top_4",
      thumbnail: "/api/placeholder/100/100",
      color: "#ffff00"
    }
  ],
  pants: [
    { 
      id: "pants1", 
      name: "Jeans", 
      type: "embedded",
      objectName: "Wolf3D_Outfit_Bottom",
      thumbnail: "/api/placeholder/100/100",
      color: "#000080"
    },
    { 
      id: "pants2", 
      name: "Shorts", 
      type: "embedded",
      objectName: "Wolf3D_Outfit_Bottom_2",
      thumbnail: "/api/placeholder/100/100",
      color: "#8B4513"
    }
  ]
};

// Component to handle external clothing items
function ExternalClothing({ item }) {
  const gltf = useLoader(GLTFLoader, item.modelPath);
  const modelRef = useRef();

  useEffect(() => {
    if (modelRef.current) {
      // Apply color to all materials in the model
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          // Create a new material to avoid modifying the cached one
          if (Array.isArray(child.material)) {
            child.material = child.material.map(mat => {
              const newMat = mat.clone();
              newMat.color.set(item.color || '#ffffff');
              return newMat;
            });
          } else {
            const newMaterial = child.material.clone();
            newMaterial.color.set(item.color || '#ffffff');
            child.material = newMaterial;
          }
        }
      });
    }
  }, [item]);

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={item.position || [0, 0, 0]}
      rotation={item.rotation || [0, 0, 0]}
      scale={item.scale || [1, 1, 1]}
    />
  );
}

function Avatar({ selectedShirt, selectedPants }) {
  const { scene } = useGLTF('https://models.readyplayer.me/6819bb571be966322d89faaa.glb');
  const avatarRef = useRef();
  
  // Find the selected clothing items
  const shirtItem = clothingStore.shirts.find(item => item.id === selectedShirt);
  const pantsItem = clothingStore.pants.find(item => item.id === selectedPants);
  
  useEffect(() => {
    if (!avatarRef.current) return;
    
    // Reset all embedded clothing visibility first
    avatarRef.current.traverse((child) => {
      if (child.isMesh) {
        // Hide all clothing items first
        if (child.name.includes('Outfit_Top') || child.name.includes('Outfit_Bottom')) {
          child.visible = false;
        }
      }
    });
    
    // Then show only the selected embedded items
    avatarRef.current.traverse((child) => {
      if (child.isMesh) {
        // Show selected shirt if it's embedded
        if (shirtItem && shirtItem.type === 'embedded' && child.name.includes(shirtItem.objectName)) {
          child.visible = true;
          // Apply color to material
          if (child.material && shirtItem.color) {
            child.material.color.set(shirtItem.color);
          }
        }
        
        // Show selected pants if it's embedded
        if (pantsItem && pantsItem.type === 'embedded' && child.name.includes(pantsItem.objectName)) {
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
  // Find the selected clothing items
  const shirtItem = clothingStore.shirts.find(item => item.id === selectedShirt);
  const pantsItem = clothingStore.pants.find(item => item.id === selectedPants);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      
      {/* Base avatar with embedded clothing */}
      <Avatar selectedShirt={selectedShirt} selectedPants={selectedPants} />
      
      {/* Load external clothing items */}
      {shirtItem && shirtItem.type === 'external' && (
        <ExternalClothing item={shirtItem} />
      )}
      
      {pantsItem && pantsItem.type === 'external' && (
        <ExternalClothing item={pantsItem} />
      )}
      
      <OrbitControls />
    </>
  );
}

function ClothingSelector({ title, items, selectedItem, onSelect }) {
  return (
    <div className="clothing-selector">
      <h3>{title}</h3>
      <div className="items-grid" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {items.map(item => (
          <div 
            key={item.id}
            className={`clothing-item ${selectedItem === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item.id)}
            style={{
              border: selectedItem === item.id ? '2px solid #000' : '1px solid #ccc',
              margin: '5px',
              padding: '5px',
              cursor: 'pointer',
              backgroundColor: item.color,
              width: '80px',
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <img src={item.thumbnail} alt={item.name} width="50" height="50" />
            <div style={{ 
              marginTop: '5px', 
              fontSize: '12px', 
              color: '#fff', 
              textShadow: '1px 1px 1px #000',
              textAlign: 'center'
            }}>
              {item.name}
            </div>
            {item.type === 'external' && (
              <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#4CAF50',
                borderRadius: '50%',
                width: '15px',
                height: '15px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                E
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Component to manage model loading errors
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // This is just a simple error UI - in a real app you'd want more robust error handling
  if (hasError) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#ffdddd', 
        border: '1px solid #ff0000',
        margin: '10px'
      }}>
        <h3>Error Loading Model</h3>
        <p>{errorMessage}</p>
        <button onClick={() => setHasError(false)}>Try Again</button>
      </div>
    );
  }

  return (
    <ErrorHandler onError={(error) => {
      console.error('Error loading 3D model:', error);
      setErrorMessage(error.message);
      setHasError(true);
    }}>
      {children}
    </ErrorHandler>
  );
}

// Helper component for error handling
function ErrorHandler({ children, onError }) {
  useEffect(() => {
    const handleError = (event) => {
      onError(event.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);
  
  return children;
}

export default function App() {
  const [selectedShirt, setSelectedShirt] = useState(clothingStore.shirts[0].id);
  const [selectedPants, setSelectedPants] = useState(clothingStore.pants[0].id);
  const [modelLoadingError, setModelLoadingError] = useState(null);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div className="canvas-container" style={{ flex: '2', height: '100%' }}>
        <ErrorBoundary>
          <Canvas style={{ height: '100%' }}>
            <Scene selectedShirt={selectedShirt} selectedPants={selectedPants} />
          </Canvas>
        </ErrorBoundary>
        
        {modelLoadingError && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '10px', backgroundColor: 'rgba(255,0,0,0.7)', color: 'white' }}>
            Error loading model: {modelLoadingError}
          </div>
        )}
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
          <p>Type: {clothingStore.shirts.find(item => item.id === selectedShirt)?.type}</p>
          {clothingStore.shirts.find(item => item.id === selectedShirt)?.type === 'external' && (
            <p>Model Path: {clothingStore.shirts.find(item => item.id === selectedShirt)?.modelPath}</p>
          )}
          <p>Pants: {clothingStore.pants.find(item => item.id === selectedPants)?.name}</p>
        </div>
        
        <div className="help-panel" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e6f7ff' }}>
          <h3>Clothing Types</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ 
              backgroundColor: '#4CAF50', 
              borderRadius: '50%', 
              width: '15px', 
              height: '15px', 
              marginRight: '5px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>E</div>
            <span>External GLB Model</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', marginRight: '5px' }}></div>
            <span>Built-in Avatar Clothing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
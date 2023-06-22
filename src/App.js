import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Moveable from 'react-moveable';

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [moveableComponents2, setMoveableComponents2] = useState([]);
  const [selected, setSelected] = useState(null);
  const [image, setImage] = useState();
  const [reload, setReload] = useState(0);
  const [reloadArray, setReloadArray] = useState(0);

  // esta funcion realiza la peticion get al api
  // se hace async dado que tiene que esperar el valor de la imagen para no setear en undefined
  // posteriormente realiza un reload en useEffect para renderizar y llamar a la funcion de creacion
  const addMoveable = async () => {
    const res = await axios({
      method: 'get',
      url: 'https://jsonplaceholder.typicode.com/photos',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });

    setImage(res.data[0 + 500]);
    setReload((r) => r + 1);
  };

  const addMoveable1 = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ['red', 'blue', 'yellow', 'green', 'purple'];
    const FIT = ['cover', 'contain', 'fill', 'none'];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        image: image,
        fit: FIT[Math.floor(Math.random() * FIT.length)],
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      // console.log('width', moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  //Esta funcion elimina el elemento seleccionado
  const handleDelete = () => {
    setMoveableComponents(
      moveableComponents.filter((item) => item.id !== selected),
    );
  };

  //Este useEffect realiza una renderizacion la cual muestra el elemento una vez realizada la carga de la imagen
  useEffect(() => {
    if (image !== undefined) {
      addMoveable1();
    } else {
      return;
    }
  }, [reload]);

  return (
    <main id='root' style={{ height: '100vh', width: '100vw' }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={(e) => handleDelete(e.target.value)}>
        delete element
      </button>
      <div
        id='parent'
        style={{
          position: 'relative',
          background: 'black',
          height: '80vh',
          width: '80vw',
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  image,
  fit,
}) => {
  const ref = useRef();
  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    fit,
  });

  let parent = document.getElementById('parent');
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      image,
      fit,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  //en este metodo se seteaban 2 parametros que realizaban el ajuste de top y left
  // lo cual hacia que el elemento tomara el absoluto
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top,
        left,
        width: newWidth,
        height: newHeight,
        color,
        image,
        fit,
      },
      true,
    );
  };

  return (
    <>
      <div
        ref={ref}
        className='draggable'
        id={'component-' + id}
        style={{
          position: 'absolute',
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundSize: fit,
          backgroundImage: `url(${image.url})`,
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            image,
            fit,
          });
        }}
        snappable={true}
        throttleDrag={1}
        edgeDraggable={false}
        onResize={onResize}
        bounds={{ left: 0, top: 0, right: 0, bottom: 0, position: 'css' }}
        scalable={true}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
        edge={false}
        zoom={1}
        origin={false}
        verticalGuidelines={[50, 150, 250, 450, 550]}
        horizontalGuidelines={[0, 100, 200, 400, 500]}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};

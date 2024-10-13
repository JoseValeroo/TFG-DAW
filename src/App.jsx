import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PrimerComponente  from './components/PrimerComponente'
//Esta es como el componente padre, el main.jsx llama a esto y renderiza esto
//ahoram esto tienes que meterle los componente
function App() {
  
   //Los componentes tienen estado (si pintas un reloj, pues la hora)
   //Tambien tienen ciclo de vida (fases, si el componente está en x)
   //Puede hacer x pero si esta en y hace x e y.
  const [count, setCount] = useState(0)
  const [nombre, setNombre] = useState('');

  //AQUI HAY MANDANGA , Para asegurarte de que el prompt solo se ejecute una vez, puedes usar el useEffect de React para 
  //ejecutar el código solo cuando el componente se monte por primera vez
  useEffect(() => {
    const userName = prompt("Dime tu nombre");
    setNombre(userName);
  }, []);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/*Esta es la sintaxis de un comentario en jsx en la parte de htmls
      es como css. Bueno aqui empiezo a tocar cosas en general, deja la parte de arriba para mirar como funciona el css.
      Las llaves de {nombre} significa q dentro de esas llaves metes otro idioma, en este caso javascript, es goood. 
      Por lo que veo, la logica del componente va fuera del return, constantes y esas cosas logicas de control, en el return solo lo que 
      quieres pintar No se porq tarda tanto en pedirte el nombre y cargarlo Creo que lo pide dos veces */}
      <h1 id="letsgo">Prueba Interpolación JavaScript {nombre}</h1>
      
      {/*Asi se llama a un componente, ademas tienes que ponerle el import arriba */}
      <PrimerComponente />
    </>
  )
}

export default App

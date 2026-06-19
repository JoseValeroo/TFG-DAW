import './Loading.css';

// Pantalla de carga discreta (fondo oscuro de la app + spinner),
// usada como fallback de las rutas lazy para no mostrar una página en blanco.
function Loading() {
  return (
    <div className="route-loading" role="status" aria-label="Cargando">
      <div className="route-spinner" />
    </div>
  );
}

export default Loading;

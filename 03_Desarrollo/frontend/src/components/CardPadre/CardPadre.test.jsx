import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardPadre from './CardPadre';

describe('CardPadre', () => {
  const props = {
    title: 'Título de prueba',
    subtitle: 'Subtítulo',
    text: 'Cuerpo del artículo',
    date: '01/01/2024',
    image: 'imagen.png',
  };

  it('muestra título, subtítulo, texto y fecha', () => {
    render(<CardPadre {...props} />);
    expect(screen.getByText('Título de prueba')).toBeInTheDocument();
    expect(screen.getByText('Subtítulo')).toBeInTheDocument();
    expect(screen.getByText('Cuerpo del artículo')).toBeInTheDocument();
    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
  });

  it('renderiza la imagen con su alt', () => {
    render(<CardPadre {...props} />);
    const img = screen.getByAltText('article-cover');
    expect(img).toHaveAttribute('src', 'imagen.png');
  });

  it('llama a onClick al pulsar la tarjeta', () => {
    const onClick = vi.fn();
    render(<CardPadre {...props} onClick={onClick} />);
    fireEvent.click(screen.getByText('Título de prueba'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

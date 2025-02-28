import "./PokeCard.css";
import Pokedex, { Pokemon } from "pokedex";
import { useMemo, useState } from "react";

const pokedex = new Pokedex();

const kUnknownPokemon: Pokemon = {
  id: "0",
  name: "unknown",
  sprites: {
    normal:
      "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
  },
};

type PokeCardProps = {
  pokeId: number;
};

export function PokeCard({ pokeId }: PokeCardProps) {
  const [checked, setChecked] = useState(false);

  const pokemon = useMemo(() => {
    return pokedex.pokemon(pokeId) ?? kUnknownPokemon;
  }, [pokeId]);

  const checkboxId = `poke-card-${pokeId}`;

  const toggleChecked = () => setChecked((isChecked) => !isChecked);

  return (
    <label htmlFor={checkboxId}>
      <div className="poke-card">
        <input
          type="checkbox"
          id={`poke-card-${pokeId}`}
          checked={checked}
          onChange={toggleChecked}
        ></input>
        <img className="poke-card--sprite" src={pokemon.sprites.normal}></img>
        <div>
          <span className="poke-card--name">{pokemon.name}</span>
          <span className="poke-card--id">
            # {String(pokemon.id).padStart(4, "0")}
          </span>
        </div>
      </div>
    </label>
  );
}

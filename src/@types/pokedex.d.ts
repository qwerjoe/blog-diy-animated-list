declare module "pokedex" {
  export interface Pokemon {
    id: string;
    name: string;
    sprites: {
      normal: string;
    };
  }

  declare class Pokedex {
    pokemon(id: number): Pokemon | undefined | null;
  }
  export default Pokedex;
}

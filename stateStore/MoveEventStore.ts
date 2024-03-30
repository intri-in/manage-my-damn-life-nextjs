import { atom } from "jotai";

export interface MoveEventModalInput{
    id: string | number | null
}
export const showMoveEventModal= atom(false)
export const moveEventModalInput = atom<MoveEventModalInput>({id: null})

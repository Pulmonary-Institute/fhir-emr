import { expandValueSet } from "../../dist/services"

export async function expandEMRValueSet(answerValueSet: string | undefined, searchText: string) {
    const predefinedValueSetsList: string[] = ['icd-10'];

    return expandValueSet({
        answerValueSet,
        searchText,
        predefinedValueSetsList,
    });
}

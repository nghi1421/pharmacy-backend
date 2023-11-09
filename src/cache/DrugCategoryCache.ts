import NodeCache from 'node-cache'
import { DrugCategory } from '../entity/DrugCategory'

const cache = new NodeCache()

const getDrugCategories = (): DrugCategory[] | undefined | null => cache.get('drug-categories')

const setDrugCategories = (drugCategories: any) => cache.set('drug-categories', drugCategories)

export default {
    getDrugCategories,
    setDrugCategories
}
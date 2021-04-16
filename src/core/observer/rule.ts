import {Thing} from '../things';
import {PropertyType} from '../types/properties';
import {NounType} from '../types/nouns';
import {OperatorType} from '../types/operators';
import {ThingType} from '../types';
import {CharacterType} from '../types/characters';

export interface FeatureCondition {
    feature: NounType | PropertyType
    on: Array<NounType>
    near: Array<NounType>
    facing: Array<NounType>
}

export interface FeatureList {
    _is: Array<FeatureCondition>
    _has: Array<FeatureCondition>
    _make: Array<FeatureCondition>
}

export interface RuleController {
    $is: (requester: Thing, requestedFeature: PropertyType) => boolean
    // $has: (requester: Thing, requestedFeature: NounType) => boolean
    // $make: (requester: Thing, requestedFeature: NounType) => boolean
    addFeature: (thing: Thing, operator: OperatorType, featureCondition: FeatureCondition) => void
    removeFeature: (thing: Thing, operator: OperatorType, featureCondition: FeatureCondition) => void
}


class RuleControllerConcrete implements RuleController {
    private _ruleMap: Map<ThingType, Array<PropertyType>> // will be deprecated
    private _featureMap: Map<ThingType, FeatureList>

    constructor() {
        this._ruleMap = new Map(); // will be deprecated
        this._featureMap = new Map();

        // set default property
        // should be changed to save in FeatureList
        (Object.keys(NounType) as Array<NounType>).map(noun => this._ruleMap.set(noun, [PropertyType.PUSH]));
        (Object.keys(PropertyType) as Array<PropertyType>).map(property => this._ruleMap.set(property, [PropertyType.PUSH]));
        (Object.keys(OperatorType) as Array<OperatorType>).map(operator => this._ruleMap.set(operator, [PropertyType.PUSH]));

        // DEBUG
        this._ruleMap.set(CharacterType.BABA, [PropertyType.YOU]) // will be deprecated

        const featureConditions = {feature: PropertyType.YOU, on: [], near: [], facing: []}
        const featureList = {_is: [featureConditions], _has: [], _make: []}
        this._featureMap.set(CharacterType.BABA, featureList)
    }

    public $is(requester: Thing, requestedFeature: PropertyType): boolean {
        const requesterName = requester.name as NounType
        const featureConditions = this._featureMap.get(requesterName) as FeatureList

        let containsProperty = false
        for (const featureCondition of featureConditions._is) {
            if (featureCondition.feature === requestedFeature) {
                containsProperty = true
                break
            }
        }

        // NOUN IS NOUN should be processed

        return Boolean(featureConditions && containsProperty)
    }

    public addFeature(thing: Thing, operator: OperatorType, featureCondition: FeatureCondition): void {
        const thingType = thing.name as ThingType

        if (!this._featureMap.has(thingType)) {
            const featureList = {_is: [], _has: [], _make: []} as FeatureList
            this._featureMap.set(thingType, featureList)
        }

        switch (operator) {
            case OperatorType.IS:
                this._featureMap.get(thingType)!._is.push(featureCondition)
                break
            case OperatorType.HAS:
                this._featureMap.get(thingType)!._has.push(featureCondition)
                break
            case OperatorType.MAKE:
                this._featureMap.get(thingType)!._make.push(featureCondition)
                break
            default:
                throw new Error(`operator ${operator} should be a verb (OperatorType.IS, OperatorType.HAS, OperatorType.MAKE) instead of an adjective`)
        }
    }

    public removeFeature(thing: Thing, operator: OperatorType, featureCondition: FeatureCondition): void {
        const thingType = thing.name as ThingType

        if (!this._featureMap.has(thingType)) throw new Error(`thingType ${thingType} not been recorded yet`)
        let removeIndex = -1
        switch (operator) {
            case OperatorType.IS:
                removeIndex = this._featureMap.get(thingType)!._is.indexOf(featureCondition)
                if (removeIndex === -1) throw new Error(`thingType ${thingType} does not contain feature ${featureCondition}`)
                this._featureMap.get(thingType)!._is.splice(removeIndex, 1)
                break
            case OperatorType.HAS:
                removeIndex = this._featureMap.get(thingType)!._has.indexOf(featureCondition)
                if (removeIndex === -1) throw new Error(`thingType ${thingType} does not contain feature ${featureCondition}`)
                this._featureMap.get(thingType)!._has.splice(removeIndex, 1)
                break
            case OperatorType.MAKE:
                removeIndex = this._featureMap.get(thingType)!._make.indexOf(featureCondition)
                if (removeIndex === -1) throw new Error(`thingType ${thingType} does not contain feature ${featureCondition}`)
                this._featureMap.get(thingType)!._make.splice(removeIndex, 1)
                break
            default:
                throw new Error(`operator ${operator} should be a verb (OperatorType.IS, OperatorType.HAS, OperatorType.MAKE) instead of an adjective`)
        }
    }
}

export const createRuleController = (): RuleController => {
    return new RuleControllerConcrete()
}

/**
 * Logger to log SDK interfaces and functions used by a skill
*/

export enum MetricsType{
    InSDK = 1,
    Component = 2
}

export abstract class Logger{
    private constructor(){}

    /**
     * Set of features used by the skill from SDK
     */
    private static inSDKfeatures: Set<string> = new Set<string>();


    /**
     * Set of components used by a skill
     */
    private static componentList: Set<string> = new Set<string>();

    /**
     * Method to log the feature
     */
    public static log(featureName: string, type: MetricsType){
        if(type==1){
            Logger.inSDKfeatures.add(featureName);
        }
        else if(type==2){
            Logger.componentList.add(featureName);
        }
    }

    /**
     * Method to get the components used by the skill
     */
    private static getComponentList(): string{
        const componentList = Array.from(Logger.componentList).toString();
        if(!componentList.length){
            return '';
        }
        const log = ' components:['+componentList+']';
        return log;
    }

    /**
     * Method to get the SDK features used by the skill
     */
    private static getInSDKfeatures(): string{
        const inSDKfeatures = Array.from(Logger.inSDKfeatures).toString();
        if(!inSDKfeatures.length){
            return '';
        }
        const log = ' sdk-dependencies:['+inSDKfeatures+']';
        return log;
    }

    /**
     * Method to get all the features used by the skill
     */
    public static getFeatures(): string{
        const log = Logger.getInSDKfeatures() + Logger.getComponentList();
        return log;
    }
}
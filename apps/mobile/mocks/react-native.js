const RNW = require('react-native-web');

module.exports = {
    ...RNW,
    TurboModuleRegistry: {
        getEnforcing: (name) => {
            console.warn(`[Mock] TurboModuleRegistry.getEnforcing('${name}') called.`);
            return null;
        },
        get: (name) => {
            console.warn(`[Mock] TurboModuleRegistry.get('${name}') called.`);
            return null;
        },
    },
    // Add other missing exports if needed
    codegenNativeComponent: (name) => {
        console.warn(`[Mock] codegenNativeComponent('${name}') called.`);
        return (props) => null;
    }
};

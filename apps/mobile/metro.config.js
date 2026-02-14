const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Polyfill for Node < 20
if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function () {
        return this.slice().reverse();
    };
}

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web') {
        if (moduleName === '@stripe/stripe-react-native') {
            return {
                filePath: path.resolve(projectRoot, 'mocks/stripe.js'),
                type: 'sourceFile',
            };
        }
        if (moduleName === 'react-native') {
            return {
                filePath: path.resolve(projectRoot, 'mocks/react-native.js'),
                type: 'sourceFile',
            };
        }
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

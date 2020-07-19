var Encore = require('@symfony/webpack-encore')

Encore.configureRuntimeEnvironment('dev')

const conf = Encore
    .setOutputPath('build/')
    .setPublicPath('/build')

    .addEntry('liform', process.cwd() + '/liform.jsx')

    .enableReactPreset()

    .disableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()

    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .enableIntegrityHashes(Encore.isProduction())

.getWebpackConfig()

conf.devServer = {
    host: '0.0.0.0',
    port: 8000,
    historyApiFallback: true,
}

module.exports = conf

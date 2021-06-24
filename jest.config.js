module.exports = {
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
    ],
    coveragePathIgnorePatterns: [],
    testMatch: [
        '<rootDir>/test/**/*.{js,jsx}',
    ],
    testPathIgnorePatterns: [
        '/_.*(?<!.test.js)$',
    ],
    transformIgnorePatterns: [
    ],
    setupFilesAfterEnv: [
        '<rootDir>/test/_setup.js',
    ],
    testEnvironment: 'jsdom',
}

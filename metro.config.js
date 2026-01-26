const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Adiciona pastas para a "lista negra" do monitoramento
config.resolver.blockList = [
  /\/android\/.*/, // Ignora tudo dentro da pasta android
  /\/ios\/.*/, // Ignora tudo dentro da pasta ios
  /\.cxx\/.*/, // Ignora pastas de cache C++
];

module.exports = config;

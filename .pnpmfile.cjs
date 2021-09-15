function readPackage(pkg) {
  delete pkg.peerDependencies['@types/node'];
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};

function readPackage(pkg) {
  // Allow build scripts for these packages
  if (['@parcel/watcher', '@swc/core', 'sharp', 'unrs-resolver'].includes(pkg.name)) {
    pkg.pnpm = pkg.pnpm || {};
    pkg.pnpm.allowBuild = true;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};

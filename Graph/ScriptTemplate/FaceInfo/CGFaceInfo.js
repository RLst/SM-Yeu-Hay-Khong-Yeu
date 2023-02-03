const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');

const Rad2Deg = 57.2958;

class CGFaceInfo extends BaseNode {
  constructor() {
    super();
    this.faceIdxMap = {
      'Face 0': 0,
      'Face 1': 1,
      'Face 2': 2,
      'Face 3': 3,
      'Face 4': 4, // assume maximum face count is 5
    };

    // holding an algorithm manager instance here
    this.algoMgr = null;
    // cache an face 2d point array here
    this.facePts2D = [];
  }

  getOutput(index) {
    const inputFaceStringEnum = this.inputs[0]();
    const faceIndex = this.faceIdxMap[inputFaceStringEnum];

    if (faceIndex === undefined || faceIndex === null) {
      return null;
    }

    if (!this._checkFaceIndexValidity(faceIndex)) {
      return null;
    }

    if (this.algoMgr === null) {
      this.algoMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    }

    let algoRes = this.algoMgr.getAEAlgorithmResult();
    let faceBaseInfo = algoRes.getFaceBaseInfo(faceIndex);
    if (!faceBaseInfo) {
      return;
    }

    if (index === 0) {
      return this._returnFaceRect(faceBaseInfo);
    } else if (index === 1) {
      return this._returnFacePos(faceBaseInfo);
    } else if (index === 2) {
      return this._returnFaceRot(faceBaseInfo);
    } else if (index === 3) {
      return this._return2DKeypoints(faceBaseInfo);
    }
  }

  _checkFaceIndexValidity(faceIndex) {
    return faceIndex === 0 || faceIndex === 1 || faceIndex === 2 || faceIndex === 3 || faceIndex === 4;
  }

  _returnFaceRect(faceBaseInfo) {
    // Amaz.rect's coordinates origin is at bottom left of screen, and normalized too
    return faceBaseInfo.rect;
  }

  _returnFacePos(faceBaseInfo) {
    return new Amaz.Vector2f(
      faceBaseInfo.rect.x + faceBaseInfo.rect.width * 0.5,
      faceBaseInfo.rect.y + faceBaseInfo.rect.height * 0.5
    );
  }

  _returnFaceRot(faceBaseInfo) {
    return new Amaz.Vector3f(faceBaseInfo.pitch * Rad2Deg, -faceBaseInfo.yaw * Rad2Deg, faceBaseInfo.roll * Rad2Deg);
  }

  _return2DKeypoints(faceBaseInfo) {
    const facePtsVec2Vec = faceBaseInfo.points_array;
    // // Consider using this logic in the future as an improvement
    // if (this.facePoints.length != face.points_array.size())
    //   this.facePoints.splice(0, this.facePoints.length)
    this.facePts2D.splice(0, this.facePts2D.length);
    for (let i = 0; i < facePtsVec2Vec.size(); i++) {
      const vec2 = facePtsVec2Vec.get(i);
      this.facePts2D.push(vec2);
    }
    return this.facePts2D;
  }
}

exports.CGFaceInfo = CGFaceInfo;

/**
 * @file CGExpressionDetection.js
 * @author liujiacheng
 * @date 2021/8/19
 * @brief CGExpressionDetection.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const { BaseNode } = require('./BaseNode');
const Amaz = effect.Amaz;

const { BEMessage, BEState } = require('./BEMessage');
const BEMsg = BEMessage.FaceExpression;
class CGExpressionDetection extends BaseNode {
  constructor() {
    super();
    this.expressionDetected = false;
    this.faceIndexMap = {
      'Face 0': 0,
      'Face 1': 1,
      'Face 2': 2,
      'Face 3': 3,
      'Face 4': 4,
      Any: -1,
    };
    this.expressionMap = {
      Happy: Amaz.FaceAttrExpression.HAPPY,
      Angry: Amaz.FaceAttrExpression.ANGRY,
      Surprise: Amaz.FaceAttrExpression.SURPRISE,
      Disgust: Amaz.FaceAttrExpression.DISGUST,
      Fear: Amaz.FaceAttrExpression.FEAR,
      Sad: Amaz.FaceAttrExpression.SAD,
      Neutral: Amaz.FaceAttrExpression.NEUTRAL,
    };
    this.expressionAction = {
      Happy: BEMsg.action.Happy.id,
      Angry: BEMsg.action.Angry.id,
      Surprise: BEMsg.action.Surprise.id,
      Disgust: BEMsg.action.Disgust.id,
      Fear: BEMsg.action.Fear.id,
      Sad: BEMsg.action.Sad.id,
      Neutral: BEMsg.action.Neutral.id,
    };
    this.lastAction = BEState.None.key;
  }

  onUpdate(sys, dt) {
    let expressionInput = this.inputs[1]();
    let whichFace = this.inputs[0]();

    const algMgr = Amaz.AmazingManager.getSingleton('Algorithm');
    const algResult = algMgr.getAEAlgorithmResult();

    if (algResult !== null && expressionInput !== null && whichFace !== null) {
      const expression = this.expressionMap[expressionInput];
      const index = this.faceIndexMap[whichFace];

      if (index === undefined || expression === undefined) {
        return;
      }

      let curExpressionDetected = false;
      if (index === -1) {
        for (let i = 0; i < 5; ++i) {
          const face = algResult.getFaceAttributeInfo(i);
          if (face) {
            curExpressionDetected = curExpressionDetected || face.exp_type === expression;
          }
        }
      } else {
        const face = algResult.getFaceAttributeInfo(index);
        if (face) {
          curExpressionDetected = face.exp_type === expression;
        }
      }

      if (curExpressionDetected && !this.expressionDetected) {
        if (this.nexts[0]) {
          this.nexts[0]();
        }
        if (sys.scene && this.lastAction !== BEState.Begin.key) {
          this.lastAction = BEState.Begin.key;
          sys.scene.postMessage(BEMsg.msgId, this.expressionAction[expressionInput], BEState.Begin.id, '');
        }
      }
      if (curExpressionDetected) {
        if (this.nexts[1]) {
          this.nexts[1]();
        }
        if (sys.scene && this.lastAction !== BEState.Stay.key) {
          this.lastAction = BEState.Stay.key;
          sys.scene.postMessage(BEMsg.msgId, this.expressionAction[expressionInput], BEState.Stay.id, '');
        }
      }
      if (!curExpressionDetected && this.expressionDetected) {
        if (this.nexts[2]) {
          this.nexts[2]();
        }
        if (sys.scene && this.lastAction !== BEState.End.key) {
          this.lastAction = BEState.End.key;
          sys.scene.postMessage(BEMsg.msgId, this.expressionAction[expressionInput], BEState.End.id, '');
        }
      }
      if (!curExpressionDetected) {
        if (this.nexts[3]) {
          this.nexts[3]();
        }
        if (sys.scene && this.lastAction !== BEState.None.key) {
          this.lastAction = BEState.None.key;
          sys.scene.postMessage(BEMsg.msgId, this.expressionAction[expressionInput], BEState.None.id, '');
        }
      }

      this.expressionDetected = curExpressionDetected;
    }
  }
}

exports.CGExpressionDetection = CGExpressionDetection;

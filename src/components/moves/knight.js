import { checkSamePiece } from './helperFunctions.js';

export default function knight(col, pos, currPositions) {
  let rPos = pos - 6, rPos1 = pos + 10, lPos = pos - 10, lPos1 = pos + 6,
      dPos = pos + 15, dPos1 = pos + 17, uPos = pos - 15, uPos1 = pos - 17;
  
  let valid = [];
  
  if (pos % 8 === 1) {
    let curValid = [rPos, rPos1, dPos1, uPos];

    for (let i = 0; i < curValid.length; i++) {
      const curPos = curValid[i];
      if (curPos <= 64 && curPos >= 1 && checkSamePiece(currPositions, curPos, col)) {
        valid.push(curPos);
      }
    }
  }

  else if (pos % 8 === 0) {
    let curValid = [lPos, lPos1, dPos, uPos1];

    for (let i = 0; i < curValid.length; i++) {
      const curPos = curValid[i];
      if (curPos <= 64 && curPos >= 1 && checkSamePiece(currPositions, curPos, col)) {
        valid.push(curPos)
      }
    }
  }

  else if (pos % 8 === 7) {
    let curValid = [lPos, lPos1, uPos, uPos1, dPos, dPos1];

    for (let i = 0; i < curValid.length; i++) {
      const curPos = curValid[i];
      if (curPos <= 64 && curPos >= 1 && checkSamePiece(currPositions, curPos, col)) {
        valid.push(curPos)
      }
    }
  }

  else if (pos % 8 === 2) {
    let curValid = [rPos, rPos1, uPos, uPos1, dPos, dPos1];

    for (let i = 0; i < curValid.length; i++) {
      const curPos = curValid[i];
      if (curPos <= 64 && curPos >= 1 && checkSamePiece(currPositions, curPos, col)) {
        valid.push(curPos)
      }
    }
  }

  else {
    let curValid = [lPos, lPos1, rPos, rPos1, uPos, uPos1, dPos, dPos1];

    for (let i = 0; i < curValid.length; i++) {
      const curPos = curValid[i];
      if (curPos <= 64 && curPos >= 1 && checkSamePiece(currPositions, curPos, col)) {
        valid.push(curPos)
      }
    }
  }

  return valid;

}
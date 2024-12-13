export function buildQuadGraph(quads, isConnectedTo, sceneManager) {
    const graph = new Map();
  
    for (const quad of quads) {
      graph.set(quad, []);
    }
  
    for (let i = 0; i < quads.length; i++) {
      const quadA = quads[i];
      for (let j = i + 1; j < quads.length; j++) {
        const quadB = quads[j];
        if (isConnectedTo(quadA, quadB, sceneManager)) {
          graph.get(quadA).push(quadB);
          graph.get(quadB).push(quadA);
        }
      }
    }
  
    return graph;
  }
  
  export function isQuadsConnected(quadA, quadB, sceneManager, threshold = 1) {
    const { camera } = sceneManager;
    // TODO: 增加法向量判断，要获取实际的法向量
    // if (quadA.normal && quadB.normal && quadA.normal !== quadB.normal) {
    //   return false;
    // }
  
    for (const key in quadA.keyPoints) {
      for (const otherKey in quadB.keyPoints) {
        const screenPosA = toScreenPosition(quadA.keyPoints[key], camera);
        const screenPosB = toScreenPosition(quadB.keyPoints[otherKey], camera);
  
        if (screenPosA.distanceTo(screenPosB) < threshold) {
          return true;
        }
      }
    }
  
    return false;
  }
  
  function toScreenPosition(point, camera) {
    const width = window.innerWidth;
    const height = window.innerHeight;
  
    const ndcPoint = point.clone().project(camera);
    return new THREE.Vector2(
      (ndcPoint.x + 1) * 0.5 * width,
      (1 - ndcPoint.y) * 0.5 * height
    );
  }
  
  export function findQuadPath(startQuad, endQuad, getNeighbors) {
    const queue = [[startQuad]];
    const visited = new Set([startQuad]);
  
    while (queue.length > 0) {
      const path = queue.shift();
      const quad = path[path.length - 1];
  
      if (quad === endQuad) {
        return path;
      }
  
      for (const neighbor of getNeighbors(quad)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
  
    return null;
  }
  
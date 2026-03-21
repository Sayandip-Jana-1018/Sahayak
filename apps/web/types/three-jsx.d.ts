/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * R3F (React Three Fiber) global JSX type declarations.
 *
 * This file MUST NOT contain any import/export statements
 * so TypeScript treats it as a global ambient declaration.
 */
declare namespace JSX {
  interface IntrinsicElements {
    // Objects
    mesh: any;
    group: any;
    primitive: any;
    scene: any;
    // Lights
    ambientLight: any;
    directionalLight: any;
    pointLight: any;
    spotLight: any;
    hemisphereLight: any;
    rectAreaLight: any;
    // Geometries
    boxGeometry: any;
    planeGeometry: any;
    circleGeometry: any;
    sphereGeometry: any;
    cylinderGeometry: any;
    coneGeometry: any;
    torusGeometry: any;
    torusKnotGeometry: any;
    ringGeometry: any;
    bufferGeometry: any;
    // Materials
    meshStandardMaterial: any;
    meshBasicMaterial: any;
    meshPhysicalMaterial: any;
    meshPhongMaterial: any;
    meshLambertMaterial: any;
    meshNormalMaterial: any;
    meshDepthMaterial: any;
    meshToonMaterial: any;
    lineBasicMaterial: any;
    lineDashedMaterial: any;
    pointsMaterial: any;
    shaderMaterial: any;
    rawShaderMaterial: any;
    spriteMaterial: any;
    shadowMaterial: any;
    // Helpers
    line: any;
    lineSegments: any;
    points: any;
    sprite: any;
    // Cameras
    perspectiveCamera: any;
    orthographicCamera: any;
    // Misc
    fog: any;
    color: any;
    instancedMesh: any;
  }
}

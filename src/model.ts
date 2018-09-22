import * as THREE from "three";

function toFaceVertices(x1: number, y1: number, x2: number, y2: number, w: number, h: number) {
	return [
		new THREE.Vector2(x1 / w, 1.0 - y2 / h),
		new THREE.Vector2(x2 / w, 1.0 - y2 / h),
		new THREE.Vector2(x2 / w, 1.0 - y1 / h),
		new THREE.Vector2(x1 / w, 1.0 - y1 / h)
	];
}

function toSkinVertices(x1: number, y1: number, x2: number, y2: number) {
	return toFaceVertices(x1, y1, x2, y2, 64.0, 64.0);
}

function toCapeVertices(x1: number, y1: number, x2: number, y2: number) {
	return toFaceVertices(x1, y1, x2, y2, 64.0, 32.0);
}

function setVertices(box: THREE.BoxGeometry, top: Array<THREE.Vector2>, bottom: Array<THREE.Vector2>, left: Array<THREE.Vector2>, front: Array<THREE.Vector2>, right: Array<THREE.Vector2>, back: Array<THREE.Vector2>) {

	box.faceVertexUvs[0] = [];
	box.faceVertexUvs[0][0] = [right[3], right[0], right[2]];
	box.faceVertexUvs[0][1] = [right[0], right[1], right[2]];
	box.faceVertexUvs[0][2] = [left[3], left[0], left[2]];
	box.faceVertexUvs[0][3] = [left[0], left[1], left[2]];
	box.faceVertexUvs[0][4] = [top[3], top[0], top[2]];
	box.faceVertexUvs[0][5] = [top[0], top[1], top[2]];
	box.faceVertexUvs[0][6] = [bottom[0], bottom[3], bottom[1]];
	box.faceVertexUvs[0][7] = [bottom[3], bottom[2], bottom[1]];
	box.faceVertexUvs[0][8] = [front[3], front[0], front[2]];
	box.faceVertexUvs[0][9] = [front[0], front[1], front[2]];
	box.faceVertexUvs[0][10] = [back[3], back[0], back[2]];
	box.faceVertexUvs[0][11] = [back[0], back[1], back[2]];
}

const esp = 0.002;

export class SkinObject extends THREE.Group {

	// body parts
	readonly head: THREE.Group;
	readonly body: THREE.Group;
	readonly rightArm: THREE.Group;
	readonly leftArm: THREE.Group;
	readonly rightLeg: THREE.Group;
	readonly leftLeg: THREE.Group;

	private modelListeners: Array<() => void> = []; // called when model(slim property) is changed
	private _slim = false;

	constructor(layer1Material: THREE.MeshBasicMaterial, layer2Material: THREE.MeshBasicMaterial) {
		super();

		// Head
		this.head = new THREE.Group();

		const headBox = new THREE.BoxGeometry(8, 8, 8, 0, 0, 0);
		setVertices(headBox,
			toSkinVertices(8, 0, 16, 8),
			toSkinVertices(16, 0, 24, 8),
			toSkinVertices(0, 8, 8, 16),
			toSkinVertices(8, 8, 16, 16),
			toSkinVertices(16, 8, 24, 16),
			toSkinVertices(24, 8, 32, 16)
		);
		const headMesh = new THREE.Mesh(headBox, layer1Material);
		this.head.add(headMesh);

		const head2Box = new THREE.BoxGeometry(9, 9, 9, 0, 0, 0);
		setVertices(head2Box,
			toSkinVertices(40, 0, 48, 8),
			toSkinVertices(48, 0, 56, 8),
			toSkinVertices(32, 8, 40, 16),
			toSkinVertices(40, 8, 48, 16),
			toSkinVertices(48, 8, 56, 16),
			toSkinVertices(56, 8, 64, 16)
		);
		const head2Mesh = new THREE.Mesh(head2Box, layer2Material);
		head2Mesh.renderOrder = -1;
		this.head.add(head2Mesh);

		this.add(this.head);

		// Body
		this.body = new THREE.Group();

		const bodyBox = new THREE.BoxGeometry(8, 12, 4, 0, 0, 0);
		setVertices(bodyBox,
			toSkinVertices(20, 16, 28, 20),
			toSkinVertices(28, 16, 36, 20),
			toSkinVertices(16, 20, 20, 32),
			toSkinVertices(20, 20, 28, 32),
			toSkinVertices(28, 20, 32, 32),
			toSkinVertices(32, 20, 40, 32)
		);
		const bodyMesh = new THREE.Mesh(bodyBox, layer1Material);
		this.body.add(bodyMesh);

		const body2Box = new THREE.BoxGeometry(9, 13.5, 4.5, 0, 0, 0);
		setVertices(body2Box,
			toSkinVertices(20, 32, 28, 36),
			toSkinVertices(28, 32, 36, 36),
			toSkinVertices(16, 36, 20, 48),
			toSkinVertices(20, 36, 28, 48),
			toSkinVertices(28, 36, 32, 48),
			toSkinVertices(32, 36, 40, 48)
		);
		const body2Mesh = new THREE.Mesh(body2Box, layer2Material);
		this.body.add(body2Mesh);

		this.body.position.y = -10;
		this.add(this.body);

		// Right Arm
		this.rightArm = new THREE.Group();
		const rightArmPivot = new THREE.Group();

		const rightArmBox = new THREE.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const rightArmMesh = new THREE.Mesh(rightArmBox, layer1Material);
		rightArmPivot.add(rightArmMesh);
		this.modelListeners.push(() => {
			rightArmMesh.scale.x = (this.slim ? 3 : 4) - esp;
			rightArmMesh.scale.y = 12 - esp;
			rightArmMesh.scale.z = 4 - esp;
			if (this.slim) {
				setVertices(rightArmBox,
					toSkinVertices(44, 16, 47, 20),
					toSkinVertices(47, 16, 50, 20),
					toSkinVertices(40, 20, 44, 32),
					toSkinVertices(44, 20, 47, 32),
					toSkinVertices(47, 20, 51, 32),
					toSkinVertices(51, 20, 54, 32)
				);
			} else {
				setVertices(rightArmBox,
					toSkinVertices(44, 16, 48, 20),
					toSkinVertices(48, 16, 52, 20),
					toSkinVertices(40, 20, 44, 32),
					toSkinVertices(44, 20, 48, 32),
					toSkinVertices(48, 20, 52, 32),
					toSkinVertices(52, 20, 56, 32)
				);
			}
			rightArmBox.uvsNeedUpdate = true;
			rightArmBox.elementsNeedUpdate = true;
		});

		const rightArm2Box = new THREE.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const rightArm2Mesh = new THREE.Mesh(rightArm2Box, layer2Material);
		rightArm2Mesh.renderOrder = 1;
		rightArmPivot.add(rightArm2Mesh);
		this.modelListeners.push(() => {
			rightArm2Mesh.scale.x = (this.slim ? 3.375 : 4.5) - esp;
			rightArm2Mesh.scale.y = 13.5 - esp;
			rightArm2Mesh.scale.z = 4.5 - esp;
			if (this.slim) {
				setVertices(rightArm2Box,
					toSkinVertices(44, 32, 47, 36),
					toSkinVertices(47, 32, 50, 36),
					toSkinVertices(40, 36, 44, 48),
					toSkinVertices(44, 36, 47, 48),
					toSkinVertices(47, 36, 51, 48),
					toSkinVertices(51, 36, 54, 48)
				);
			} else {
				setVertices(rightArm2Box,
					toSkinVertices(44, 32, 48, 36),
					toSkinVertices(48, 32, 52, 36),
					toSkinVertices(40, 36, 44, 48),
					toSkinVertices(44, 36, 48, 48),
					toSkinVertices(48, 36, 52, 48),
					toSkinVertices(52, 36, 56, 48)
				);
			}
			rightArm2Box.uvsNeedUpdate = true;
			rightArm2Box.elementsNeedUpdate = true;
		});

		rightArmPivot.position.y = -6;
		this.rightArm.add(rightArmPivot);
		this.rightArm.position.y = -4;
		this.modelListeners.push(() => {
			this.rightArm.position.x = this.slim ? -5.5 : -6;
		});
		this.add(this.rightArm);

		// Left Arm
		this.leftArm = new THREE.Group();
		const leftArmPivot = new THREE.Group();

		const leftArmBox = new THREE.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const leftArmMesh = new THREE.Mesh(leftArmBox, layer1Material);
		leftArmPivot.add(leftArmMesh);
		this.modelListeners.push(() => {
			leftArmMesh.scale.x = (this.slim ? 3 : 4) - esp;
			leftArmMesh.scale.y = 12 - esp;
			leftArmMesh.scale.z = 4 - esp;
			if (this.slim) {
				setVertices(leftArmBox,
					toSkinVertices(36, 48, 39, 52),
					toSkinVertices(39, 48, 42, 52),
					toSkinVertices(32, 52, 36, 64),
					toSkinVertices(36, 52, 39, 64),
					toSkinVertices(39, 52, 43, 64),
					toSkinVertices(43, 52, 46, 64)
				);
			} else {
				setVertices(leftArmBox,
					toSkinVertices(36, 48, 40, 52),
					toSkinVertices(40, 48, 44, 52),
					toSkinVertices(32, 52, 36, 64),
					toSkinVertices(36, 52, 40, 64),
					toSkinVertices(40, 52, 44, 64),
					toSkinVertices(44, 52, 48, 64)
				);
			}
			leftArmBox.uvsNeedUpdate = true;
			leftArmBox.elementsNeedUpdate = true;
		});

		const leftArm2Box = new THREE.BoxGeometry(1, 1, 1, 0, 0, 0); // w/d/h is model-related
		const leftArm2Mesh = new THREE.Mesh(leftArm2Box, layer2Material);
		leftArm2Mesh.renderOrder = 1;
		leftArmPivot.add(leftArm2Mesh);
		this.modelListeners.push(() => {
			leftArm2Mesh.scale.x = (this.slim ? 3.375 : 4.5) - esp;
			leftArm2Mesh.scale.y = 13.5 - esp;
			leftArm2Mesh.scale.z = 4.5 - esp;
			if (this.slim) {
				setVertices(leftArm2Box,
					toSkinVertices(52, 48, 55, 52),
					toSkinVertices(55, 48, 58, 52),
					toSkinVertices(48, 52, 52, 64),
					toSkinVertices(52, 52, 55, 64),
					toSkinVertices(55, 52, 59, 64),
					toSkinVertices(59, 52, 62, 64)
				);
			} else {
				setVertices(leftArm2Box,
					toSkinVertices(52, 48, 56, 52),
					toSkinVertices(56, 48, 60, 52),
					toSkinVertices(48, 52, 52, 64),
					toSkinVertices(52, 52, 56, 64),
					toSkinVertices(56, 52, 60, 64),
					toSkinVertices(60, 52, 64, 64)
				);
			}
			leftArm2Box.uvsNeedUpdate = true;
			leftArm2Box.elementsNeedUpdate = true;
		});

		leftArmPivot.position.y = -6;
		this.leftArm.add(leftArmPivot);
		this.leftArm.position.y = -4;
		this.modelListeners.push(() => {
			this.leftArm.position.x = this.slim ? 5.5 : 6;
		});
		this.add(this.leftArm);

		// Right Leg
		this.rightLeg = new THREE.Group();
		const rightLegPivot = new THREE.Group();

		const rightLegBox = new THREE.BoxGeometry(4 - esp, 12 - esp, 4 - esp, 0, 0, 0);
		setVertices(rightLegBox,
			toSkinVertices(4, 16, 8, 20),
			toSkinVertices(8, 16, 12, 20),
			toSkinVertices(0, 20, 4, 32),
			toSkinVertices(4, 20, 8, 32),
			toSkinVertices(8, 20, 12, 32),
			toSkinVertices(12, 20, 16, 32)
		);
		const rightLegMesh = new THREE.Mesh(rightLegBox, layer1Material);
		rightLegPivot.add(rightLegMesh);

		const rightLeg2Box = new THREE.BoxGeometry(4.5 - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
		setVertices(rightLeg2Box,
			toSkinVertices(4, 32, 8, 36),
			toSkinVertices(8, 32, 12, 36),
			toSkinVertices(0, 36, 4, 48),
			toSkinVertices(4, 36, 8, 48),
			toSkinVertices(8, 36, 12, 48),
			toSkinVertices(12, 36, 16, 48)
		);
		const rightLeg2Mesh = new THREE.Mesh(rightLeg2Box, layer2Material);
		rightLeg2Mesh.renderOrder = 1;
		rightLegPivot.add(rightLeg2Mesh);

		rightLegPivot.position.y = -6;
		this.rightLeg.add(rightLegPivot);
		this.rightLeg.position.y = -16;
		this.rightLeg.position.x = -2;
		this.add(this.rightLeg);

		// Left Leg
		this.leftLeg = new THREE.Group();
		const leftLegPivot = new THREE.Group();

		const leftLegBox = new THREE.BoxGeometry(4 - esp, 12 - esp, 4 - esp, 0, 0, 0);
		setVertices(leftLegBox,
			toSkinVertices(20, 48, 24, 52),
			toSkinVertices(24, 48, 28, 52),
			toSkinVertices(16, 52, 20, 64),
			toSkinVertices(20, 52, 24, 64),
			toSkinVertices(24, 52, 28, 64),
			toSkinVertices(28, 52, 32, 64)
		);
		const leftLegMesh = new THREE.Mesh(leftLegBox, layer1Material);
		leftLegPivot.add(leftLegMesh);

		const leftLeg2Box = new THREE.BoxGeometry(4.5 - esp, 13.5 - esp, 4.5 - esp, 0, 0, 0);
		setVertices(leftLeg2Box,
			toSkinVertices(4, 48, 8, 52),
			toSkinVertices(8, 48, 12, 52),
			toSkinVertices(0, 52, 4, 64),
			toSkinVertices(4, 52, 8, 64),
			toSkinVertices(8, 52, 12, 64),
			toSkinVertices(12, 52, 16, 64)
		);
		const leftLeg2Mesh = new THREE.Mesh(leftLeg2Box, layer2Material);
		leftLeg2Mesh.renderOrder = 1;
		leftLegPivot.add(leftLeg2Mesh);

		leftLegPivot.position.y = -6;
		this.leftLeg.add(leftLegPivot);
		this.leftLeg.position.y = -16;
		this.leftLeg.position.x = 2;
		this.add(this.leftLeg);

		this.slim = false;
	}

	get slim() {
		return this._slim;
	}

	set slim(value) {
		this._slim = value;
		this.modelListeners.forEach(listener => listener());
	}
}

export class CapeObject extends THREE.Group {

	readonly cape: THREE.Mesh;

	constructor(capeMaterial: THREE.MeshBasicMaterial) {
		super();

		// back = outside
		// front = inside
		const capeBox = new THREE.BoxGeometry(10, 16, 1, 0, 0, 0);
		setVertices(capeBox,
			toCapeVertices(1, 0, 11, 1),
			toCapeVertices(11, 0, 21, 1),
			toCapeVertices(11, 1, 12, 17),
			toCapeVertices(12, 1, 22, 17),
			toCapeVertices(0, 1, 1, 17),
			toCapeVertices(1, 1, 11, 17)
		);
		this.cape = new THREE.Mesh(capeBox, capeMaterial);
		this.cape.position.y = -8;
		this.cape.position.z = -0.5;
		this.add(this.cape);
	}
}

export class PlayerObject extends THREE.Group {

	readonly skin: SkinObject;
	readonly cape: CapeObject;

	constructor(layer1Material: THREE.MeshBasicMaterial, layer2Material: THREE.MeshBasicMaterial, capeMaterial: THREE.MeshBasicMaterial) {
		super();

		this.skin = new SkinObject(layer1Material, layer2Material);
		this.add(this.skin);

		this.cape = new CapeObject(capeMaterial);
		this.cape.position.z = -2;
		this.cape.position.y = -4;
		this.cape.rotation.x = 25 * Math.PI / 180;
		this.add(this.cape);
	}
}

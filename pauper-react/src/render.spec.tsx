import * as React from "react";

import { Blit, Clear, Stroke, RenderTarget, Scale, Fill, Origin, Rotate } from "@morleydev/pauper-render/render-frame.model";
import { Circle, Rectangle } from "@morleydev/pauper-core/models/shapes.model";
import { RGB, RGBA } from "@morleydev/pauper-core/models/colour.model";

import { render } from "./render";
import { createElement } from "react";
import { test } from "tap";
import { Vector2 } from "@morleydev/pauper-core/maths/vector.maths";

test("render/jsx/render", test => {
	test.test("simple", test => {
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<blit dst={Rectangle(-25, -25, 100, 50)} image="test_image.png" />
				<scale by={Vector2(2, 3)}>
					<stroke shape={Circle(0, 0, 25)} colour={RGBA(100, 200, 100, 0.5)} />
					<rotate radians={0.2}>
						<fill shape={Circle(0, 0, 25)} colour={RGBA(100, 200, 100, 0.5)} />
					</rotate>
				</scale>
				<origin coords={Vector2(20, -10)}>
					<>
						<stroke shape={Circle(0, 0, 25)} colour={RGBA(100, 200, 100, 0.5)} />
					</>
				</origin>
			</clear>
		);

		const frame = renderer();
		test.deepEqual(frame, [[
			Clear(RGB(0, 0, 0)),
			[
				Blit("test_image.png", Rectangle(-25, -25, 100, 50)),
				Scale(Vector2(2, 3), [
					Stroke(Circle(0, 0, 25), RGBA(100, 200, 100, 0.5)),
					Rotate(0.2, [
						Fill(Circle(0, 0, 25), RGBA(100, 200, 100, 0.5)),
					]),
				]),
				Origin(Vector2(20, -10), [
					Stroke(Circle(0, 0, 25), RGBA(100, 200, 100, 0.5))
				])
			]
		]]);
		test.end();
	});
	test.test("state", test => {
		let setY = (y: number) => { };
		class TestStateComponent extends React.Component<{ x: number }, { y: number }> {
			state = { y: 0 };
			componentWillMount() {
				setY = y => this.setState({ y });
			}

			render() {
				return (
					<origin coords={Vector2(5, 10)}>
						<rotate radians={0.25}>
							<scale by={Vector2(2, 3)}>
								<stroke shape={Rectangle(this.props.x, this.state.y, 50, 25)} colour={RGB(25, 50, 100)} />
							</scale>
						</rotate>
					</origin>
				);
			}
		}
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<TestStateComponent x={10} />
			</clear>
		);
		const frame1 = renderer();
		test.deepEqual(frame1, [[
			Clear(RGB(0, 0, 0)),
			[
				Origin(Vector2(5, 10), [
					Rotate(0.25, [
						Scale(Vector2(2, 3), [
							Stroke(Rectangle(10, 0, 50, 25), RGB(25, 50, 100))
						])
					])
				])
			]
		]]);
		setY(20);
		const frame2 = renderer();
		test.deepEqual(frame2, [[
			Clear(RGB(0, 0, 0)),
			[

				Origin(Vector2(5, 10), [
					Rotate(0.25, [
						Scale(Vector2(2, 3), [
							Stroke(Rectangle(10, 20, 50, 25), RGB(25, 50, 100))
						])
					])
				])
			]
		]]);

		test.end();
	});
	test.test("renderTarget", test => {
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<rendertarget id="test_rt" dst={Rectangle(25, 25, 100, 100)}>
					<blit dst={Rectangle(-25, -25, 100, 50)} image="test_image.png"></blit>
				</rendertarget>
			</clear>
		);

		const frame1 = renderer();
		test.deepEqual(frame1, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100), [
					Blit("test_image.png", Rectangle(-25, -25, 100, 50))
				])
			]]
		]);

		const frame2 = renderer();
		test.deepEqual(frame2, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_rt", Rectangle(25, 25, 100, 100))
			]
		]]);
		test.end();
	});
	test.test("state with renderTarget", test => {
		let setY = (y: number) => { };
		let setZ = (z: number) => { };

		class TestInnerComponent extends React.Component<{ x: number }, { y: number }> {
			state = { y: 0 };
			componentWillMount() {
				setY = y => this.setState(state => ({ ...state, y }));
			}
			render() {
				return <origin coords={Vector2(5, 10)}>
					<rotate radians={0.25}>
						<scale by={Vector2(2, 3)}>
							<stroke shape={Rectangle(this.props.x, this.state.y, 50, 25)} colour={RGB(25, 50, 100)} />
						</scale>
					</rotate>
				</origin>
			}
		}

		class TestStateComponent extends React.Component<{}, { z: number }> {
			state = { z: 0 };
			componentWillMount() {
				setZ = z => this.setState(state => ({ ...state, z }));
			}

			render() {
				return (
					<rendertarget id="test_id" dst={Rectangle(5, this.state.z, 25, 30)}>
						<TestInnerComponent x={10} />
					</rendertarget>
				);
			}
		}
		const renderer = render(
			<clear colour={RGB(0, 0, 0)}>
				<TestStateComponent />
			</clear>
		);
		const frame1 = renderer();
		test.deepEqual(frame1, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 0, 25, 30), [
					Origin(Vector2(5, 10), [
						Rotate(0.25, [
							Scale(Vector2(2, 3), [
								Stroke(Rectangle(10, 0, 50, 25), RGB(25, 50, 100))
							])
						])
					])
				])
			]
		]]);
		const frame2 = renderer();
		test.deepEqual(frame2, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 0, 25, 30))
			]
		]]);
		setZ(10);
		const frame3 = renderer();
		test.deepEqual(frame3, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 10, 25, 30))
			]
		]]);
		setY(20);
		const frame4 = renderer();
		test.deepEqual(frame4, [[
			Clear(RGB(0, 0, 0)),
			[
				RenderTarget("test_id", Rectangle(5, 10, 25, 30), [
					Origin(Vector2(5, 10), [
						Rotate(0.25, [
							Scale(Vector2(2, 3), [
								Stroke(Rectangle(10, 20, 50, 25), RGB(25, 50, 100))
							])
						])
					])
				])
			]
		]]);

		test.end();
	});
	test.end();
});
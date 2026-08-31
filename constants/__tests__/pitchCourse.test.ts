import {
  PITCH_COURSES,
  detectPitchCourse,
  pitchCourseCenter,
} from "@constants/pitchCourse";

describe("detectPitchCourse", () => {
  it("図の中心は真ん中のコース (13)", () => {
    expect(detectPitchCourse({ x: 0.5, y: 0.5 })).toBe(13);
  });

  it("四隅はそれぞれ角のコースになる", () => {
    expect(detectPitchCourse({ x: 0, y: 0 })).toBe(1);
    expect(detectPitchCourse({ x: 1, y: 0 })).toBe(5);
    expect(detectPitchCourse({ x: 0, y: 1 })).toBe(21);
    expect(detectPitchCourse({ x: 1, y: 1 })).toBe(25);
  });

  it("外周のボールゾーンは内側のマスより細い", () => {
    // 外周トラックの終端は 0.62 / 4.24 ≒ 0.146。
    expect(detectPitchCourse({ x: 0.14, y: 0.5 })).toBe(11);
    expect(detectPitchCourse({ x: 0.16, y: 0.5 })).toBe(12);
  });

  it("範囲外の座標は端のコースに丸められる", () => {
    expect(detectPitchCourse({ x: -0.5, y: 1.5 })).toBe(21);
  });

  it("全 25 コースの中心座標は自分自身のコースに解決する", () => {
    PITCH_COURSES.forEach((course) => {
      expect(detectPitchCourse(pitchCourseCenter(course))).toBe(course);
    });
  });
});

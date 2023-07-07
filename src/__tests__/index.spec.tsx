import React from "react";
import { within, screen, render } from "@testing-library/react";
import { expect, test } from "vitest";
import CallToActionWithIllustration from "../pages/index";

test("home", () => {
  render(<CallToActionWithIllustration />);
  const main = within(screen.getByRole("main"));
  expect(
    main.getByRole("heading", { level: 1, name: /welcome to next\.js!/i })
  ).toBeDefined();

  const footer = within(screen.getByRole("contentinfo"));
  const link = within(footer.getByRole("link"));
  expect(link.getByRole("img", { name: /vercel logo/i })).toBeDefined();
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import GoogleReviewsManager from "../../src/components/admin/GoogleReviewsManager";

function response(data: unknown, ok = true, status = 200) { return { ok, status, json: async () => data } as Response; }
beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
const review = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", authorName: "A Reviewer", rating: 5, reviewText: "Great service", isPublished: false, sortOrder: 0, sourceCreatedAt: "2026-09-01" };

test("manual review form creates a draft with reviewer, rating, date, text and display order", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [] }))
    .mockResolvedValueOnce(response({ success: true, item: { ...review, _id: "new" } }, true, 201))
    .mockResolvedValueOnce(response({ success: true, items: [{ ...review, _id: "new" }] }));
  render(<GoogleReviewsManager />);
  await screen.findByText("No reviews added yet");
  await userEvent.click(screen.getByRole("button", { name: /add google review/i }));
  await userEvent.type(screen.getByLabelText("Reviewer name"), "A Reviewer");
  await userEvent.selectOptions(screen.getByLabelText("Rating"), "4");
  fireEvent.change(screen.getByLabelText("Review date"), { target: { value: "2026-09-01" } });
  await userEvent.clear(screen.getByLabelText("Display order (lower appears first)"));
  await userEvent.type(screen.getByLabelText("Display order (lower appears first)"), "3");
  await userEvent.type(screen.getByLabelText("Review text"), "Great service");
  await userEvent.click(screen.getByRole("button", { name: "Save Draft" }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][0]).toBe("/api/admin/content?action=google-reviews");
  expect(request.mock.calls[1][1]?.method).toBe("POST");
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toMatchObject({
    authorName: "A Reviewer", rating: 4, sourceCreatedAt: "2026-09-01",
    reviewText: "Great service", sortOrder: 3, isPublished: false,
  });
});

test("review can be published, unpublished and deleted", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review] }))
    .mockResolvedValueOnce(response({ success: true, isPublished: true }))
    .mockResolvedValueOnce(response({ success: true, items: [{ ...review, isPublished: true }] }))
    .mockResolvedValueOnce(response({ success: true, isPublished: false }))
    .mockResolvedValueOnce(response({ success: true, items: [review] }))
    .mockResolvedValueOnce(response({ success: true, deleted: 1 }))
    .mockResolvedValueOnce(response({ success: true, items: [] }));
  vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.click(screen.getByRole("button", { name: "Publish" }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toEqual({ action: "publish" });
  await userEvent.click(screen.getByRole("button", { name: "Unpublish" }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(5));
  expect(JSON.parse(String(request.mock.calls[3][1]?.body))).toEqual({ action: "unpublish" });
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(7));
  expect(request.mock.calls[5][1]?.method).toBe("DELETE");
});

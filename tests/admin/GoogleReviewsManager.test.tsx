import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import GoogleReviewsManager from "../../src/components/admin/GoogleReviewsManager";

function response(data: unknown) { return { ok: true, status: 200, json: async () => data } as Response; }
beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
const review = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", googleReviewId: "g-1", authorName: "A Reviewer", rating: 5, reviewText: "Great service", isPublished: false, sortOrder: 0, sourceCreatedAt: "2026-09-01T10:00:00.000Z" };

test("selecting a review does not publish it until the explicit publish action", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review], syncAvailable: false, syncMessage: "API access is not verified." }))
    .mockResolvedValueOnce(response({ success: true, updated: 1 }))
    .mockResolvedValueOnce(response({ success: true, items: [{ ...review, isPublished: true }], syncAvailable: false }));
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.click(screen.getByRole("checkbox", { name: "Select review by A Reviewer" }));
  expect(request).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole("button", { name: "Publish Selected Reviews" }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][1]?.method).toBe("PUT");
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toEqual({ ids: [review._id], action: "publish" });
});

test("Google sync remains disabled until API access is verified", async () => {
  vi.mocked(fetch).mockResolvedValue(response({ success: true, items: [], syncAvailable: false, syncMessage: "Google Business Profile API access has not been verified. Sync is disabled." }));
  render(<GoogleReviewsManager />);
  await screen.findByText("No synced Google reviews yet");
  expect(screen.getByRole("button", { name: "Sync from Google" })).toBeDisabled();
  expect(screen.getByText(/API access has not been verified/i)).toBeInTheDocument();
});

test("delete confirmation explains only the local copy is removed", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review], syncAvailable: false }))
    .mockResolvedValueOnce(response({ success: true, deleted: 1 }))
    .mockResolvedValueOnce(response({ success: true, items: [], syncAvailable: false }));
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.click(screen.getByRole("checkbox", { name: "Select review by A Reviewer" }));
  await screen.findByText("1 selected");
  expect(screen.getByRole("button", { name: "Delete Selected Synced Reviews" })).toBeEnabled();
  await userEvent.click(screen.getByRole("button", { name: "Delete Selected Synced Reviews" }));
  expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/local copy.*original Google review will not be modified/i));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][1]?.method).toBe("DELETE");
});

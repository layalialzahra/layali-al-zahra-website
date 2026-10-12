import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import GoogleReviewsManager from "../../src/components/admin/GoogleReviewsManager";

function response(data: unknown, ok = true, status = 200) { return { ok, status, json: async () => data } as Response; }
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

test("rating and publication filters are sent to the admin API", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review], syncAvailable: false }))
    .mockResolvedValueOnce(response({ success: true, items: [], syncAvailable: false }));
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.selectOptions(screen.getByRole("combobox", { name: "Filter by rating" }), "4");
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  expect(String(request.mock.calls[1][0])).toContain("rating=4");
  await userEvent.selectOptions(screen.getByRole("combobox", { name: "Filter by publication" }), "false");
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(String(request.mock.calls[2][0])).toContain("rating=4");
  expect(String(request.mock.calls[2][0])).toContain("isPublished=false");
});

test("search submits the entered text to the API", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review], syncAvailable: false }))
    .mockResolvedValueOnce(response({ success: true, items: [], syncAvailable: false }));
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.type(screen.getByRole("textbox", { name: "Search reviews" }), "A Reviewer");
  await userEvent.click(screen.getByRole("button", { name: "Search" }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  expect(String(request.mock.calls[1][0])).toContain("search=A+Reviewer");
});

test("explicit unpublish persists after the list reloads", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [{ ...review, isPublished: true }], syncAvailable: false }))
    .mockResolvedValueOnce(response({ success: true, updated: 1 }))
    .mockResolvedValueOnce(response({ success: true, items: [{ ...review, isPublished: false }], syncAvailable: false }));
  render(<GoogleReviewsManager />);
  await screen.findByText("Published");
  await userEvent.click(screen.getByRole("checkbox", { name: "Select review by A Reviewer" }));
  await userEvent.click(screen.getByRole("button", { name: "Unpublish Selected" }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1][1]?.method).toBe("PUT");
  expect(JSON.parse(String(request.mock.calls[1][1]?.body))).toEqual({ ids: [review._id], action: "unpublish" });
  expect(await screen.findByText("Unpublished")).toBeInTheDocument();
});

test("cancelled deletion never sends a delete request", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review], syncAvailable: false }));
  vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.click(screen.getByRole("checkbox", { name: "Select review by A Reviewer" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete Selected Synced Reviews" }));
  expect(window.confirm).toHaveBeenCalledOnce();
  expect(request).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Great service")).toBeInTheDocument();
});

test("shows loading state until the first list request resolves", async () => {
  let resolveRequest!: (value: Response) => void;
  vi.mocked(fetch).mockReturnValueOnce(new Promise<Response>((resolve) => { resolveRequest = resolve; }));
  render(<GoogleReviewsManager />);
  expect(screen.getByText("Loading Google reviews…")).toBeInTheDocument();
  resolveRequest(response({ success: true, items: [review], syncAvailable: false }));
  expect(await screen.findByText("Great service")).toBeInTheDocument();
  expect(screen.queryByText("Loading Google reviews…")).not.toBeInTheDocument();
});

test("shows load errors instead of silently presenting an empty result", async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("Admin review list unavailable"));
  render(<GoogleReviewsManager />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Admin review list unavailable");
  expect(screen.queryByText("No synced Google reviews yet")).not.toBeInTheDocument();
});

test("a failed sync reports the error and does not clear the last displayed review", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review], syncAvailable: true, syncMessage: "Credentials configured." }))
    .mockResolvedValueOnce(response({ success: false, message: "Google review sync failed. Previous local reviews were retained." }, false, 502));
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.click(screen.getByRole("button", { name: "Sync from Google" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Previous local reviews were retained");
  expect(screen.getByText("Great service")).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

test("a failed publication request leaves the review visible and reports the error", async () => {
  const request = vi.mocked(fetch);
  request.mockResolvedValueOnce(response({ success: true, items: [review], syncAvailable: false }))
    .mockResolvedValueOnce(response({ success: false, message: "Review update unavailable." }, false, 503));
  render(<GoogleReviewsManager />);
  await screen.findByText("Great service");
  await userEvent.click(screen.getByRole("checkbox", { name: "Select review by A Reviewer" }));
  await userEvent.click(screen.getByRole("button", { name: "Publish Selected Reviews" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Review update unavailable.");
  expect(screen.getByText("Great service")).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

import { getDuration, stripToInt, Thumbnails } from "../../common";
import { BaseChannel } from "../BaseChannel";
var VideoCompactParser = /** @class */ (function () {
    function VideoCompactParser() {
    }
    VideoCompactParser.loadVideoCompact = function (target, data) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            if (data.videoId) {
                // Old format
                var videoId = data.videoId, title = data.title, headline = data.headline, lengthText = data.lengthText, thumbnail = data.thumbnail, ownerText = data.ownerText, shortBylineText = data.shortBylineText, publishedTimeText = data.publishedTimeText, viewCountText = data.viewCountText, badges = data.badges, thumbnailOverlays = data.thumbnailOverlays, channelThumbnailSupportedRenderers = data.channelThumbnailSupportedRenderers, detailedMetadataSnippets = data.detailedMetadataSnippets;
                target.id = videoId;
                target.title = headline
                    ? headline.simpleText
                    : title.simpleText || ((_b = (_a = title.runs) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) || "";
                target.thumbnails = new Thumbnails().load(thumbnail.thumbnails);
                target.uploadDate = publishedTimeText === null || publishedTimeText === void 0 ? void 0 : publishedTimeText.simpleText;
                target.description =
                    ((_c = detailedMetadataSnippets === null || detailedMetadataSnippets === void 0 ? void 0 : detailedMetadataSnippets[0].snippetText.runs) === null || _c === void 0 ? void 0 : _c.map(function (r) { return r.text; }).join("")) || "";
                target.duration =
                    getDuration((lengthText === null || lengthText === void 0 ? void 0 : lengthText.simpleText) || ((_d = thumbnailOverlays === null || thumbnailOverlays === void 0 ? void 0 : thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer) === null || _d === void 0 ? void 0 : _d.text.simpleText) ||
                        "") || null;
                target.isLive =
                    !!((badges === null || badges === void 0 ? void 0 : badges[0].metadataBadgeRenderer.style) === "BADGE_STYLE_TYPE_LIVE_NOW") ||
                        ((_e = thumbnailOverlays === null || thumbnailOverlays === void 0 ? void 0 : thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer) === null || _e === void 0 ? void 0 : _e.style) === "LIVE";
                // Channel
                if (ownerText || shortBylineText) {
                    var browseEndpoint = (_g = (_f = (ownerText || shortBylineText).runs[0]) === null || _f === void 0 ? void 0 : _f.navigationEndpoint) === null || _g === void 0 ? void 0 : _g.browseEndpoint;
                    if (browseEndpoint) {
                        var id = browseEndpoint.browseId;
                        var thumbnails = channelThumbnailSupportedRenderers === null || channelThumbnailSupportedRenderers === void 0 ? void 0 : channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails;
                        target.channel = new BaseChannel({
                            id: id,
                            name: (ownerText || shortBylineText).runs[0].text,
                            thumbnails: thumbnails ? new Thumbnails().load(thumbnails) : undefined,
                            client: target.client,
                        });
                    }
                }
                target.viewCount = stripToInt((viewCountText === null || viewCountText === void 0 ? void 0 : viewCountText.simpleText) || (viewCountText === null || viewCountText === void 0 ? void 0 : viewCountText.runs[0].text));
            }
            else if (data.type === "ReelItem") {
                // New format
                console.log("Hit reel item");
                var id = data.id, title = data.title, thumbnails = data.thumbnails, endpoint = data.endpoint, accessibility_label = data.accessibility_label;
                target.id = id;
                target.title = title.text;
                target.thumbnails = new Thumbnails().load(thumbnails);
                target.uploadDate = ""; // Not available in new format
                target.description = ""; // Not available in new format
                target.duration = null; // Not available in new format
                target.isLive = false; // Not available in new format
                // Channel information not available in new format
                target.channel = undefined;
                // Extract view count from accessibility_label
                var viewCountMatch = accessibility_label.match(/(\d+) views/);
                target.viewCount = viewCountMatch ? parseInt(viewCountMatch[1]) : 0;
            }
            else {
                console.error("Unrecognized video data format:", data);
            }
            return target;
        }
        catch (error) {
            console.error("Error parsing video compact:", error);
            console.error("Data:", data.ownerText || data.shortBylineText || data);
            throw new Error("Error parsing video compact");
        }
    };
    return VideoCompactParser;
}());
export { VideoCompactParser };

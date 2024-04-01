var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { Thumbnails } from "../../common";
import { BaseChannel } from "../BaseChannel";
import { PlaylistCompact } from "../PlaylistCompact";
import { VideoCompact } from "../VideoCompact";
var ChannelParser = /** @class */ (function () {
    function ChannelParser() {
    }
    ChannelParser.loadChannel = function (target, data) {
        var _a;
        if (data.header && data.header.c4TabbedHeaderRenderer) {
            // Handle c4TabbedHeader format
            var _b = data.header.c4TabbedHeaderRenderer, channelId = _b.channelId, title = _b.title, avatar = _b.avatar, subscriberCountText = _b.subscriberCountText;
            target.id = channelId;
            target.name = title;
            target.thumbnails = new Thumbnails().load(avatar.thumbnails);
            target.videoCount = 0; // data not available in old format
            target.subscriberCount = subscriberCountText === null || subscriberCountText === void 0 ? void 0 : subscriberCountText.simpleText;
            var _c = data.header.c4TabbedHeaderRenderer, tvBanner = _c.tvBanner, mobileBanner = _c.mobileBanner, banner = _c.banner;
            target.banner = new Thumbnails().load((banner === null || banner === void 0 ? void 0 : banner.thumbnails) || []);
            target.tvBanner = new Thumbnails().load((tvBanner === null || tvBanner === void 0 ? void 0 : tvBanner.thumbnails) || []);
            target.mobileBanner = new Thumbnails().load((mobileBanner === null || mobileBanner === void 0 ? void 0 : mobileBanner.thumbnails) || []);
        }
        else if (data.header && data.header.pageHeaderRenderer) {
            // Handle pageHeader format
            var _d = data.header.pageHeaderRenderer.content.pageHeaderViewModel, title = _d.title, image = _d.image, metadata = _d.metadata, banner = _d.banner;
            target.id = metadata.external_id;
            target.name = title.text;
            target.thumbnails = new Thumbnails().load(image.avatar.image);
            target.videoCount = parseInt(metadata.metadata_rows[1].metadata_parts[1].text.text.split(" ")[0]);
            target.subscriberCount = (_a = metadata.metadata_rows
                .flatMap(function (row) { return row.metadata_parts ? row.metadata_parts : []; })
                .find(function (part) { var _a; return (_a = part.text.text) === null || _a === void 0 ? void 0 : _a.includes("subscriber"); })) === null || _a === void 0 ? void 0 : _a.text.text;
            if (!target.subscriberCount)
                console.log("Subscriber count not found in metadata:", metadata);
            target.banner = new Thumbnails().load(banner.image);
            console.log(target);
        }
        target.shelves = ChannelParser.parseShelves(target, data);
        return target;
    };
    ChannelParser.parseShelves = function (target, data) {
        var e_1, _a;
        var shelves = [];
        if (!data.header)
            return shelves;
        var rawShelves = data.header.c4TabbedHeaderRenderer
            ? data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents
            : data.header.content.current_tab.content.contents;
        try {
            for (var rawShelves_1 = __values(rawShelves), rawShelves_1_1 = rawShelves_1.next(); !rawShelves_1_1.done; rawShelves_1_1 = rawShelves_1.next()) {
                var rawShelf = rawShelves_1_1.value;
                if (data.header.c4TabbedHeaderRenderer) {
                    // Handler for c4TabbedHeaderRenderer
                    if (!rawShelf.itemSectionRenderer)
                        continue;
                    var shelfRenderer = rawShelf.itemSectionRenderer.contents[0].shelfRenderer;
                    if (!shelfRenderer)
                        continue;
                    var title = shelfRenderer.title, content = shelfRenderer.content, subtitle = shelfRenderer.subtitle;
                    if (!content.horizontalListRenderer)
                        continue;
                    var shelfItems = content.horizontalListRenderer.items.map(function (i) {
                        if (i.gridVideoRenderer) {
                            return new VideoCompact({ client: target.client }).load(i.gridVideoRenderer);
                        }
                        if (i.gridPlaylistRenderer) {
                            return new PlaylistCompact({ client: target.client }).load(i.gridPlaylistRenderer);
                        }
                        if (i.gridChannelRenderer) {
                            return new BaseChannel({ client: target.client }).load(i.gridChannelRenderer);
                        }
                        return undefined;
                    }).filter(function (i) { return i !== undefined; });
                    shelves.push({
                        title: title.simpleText || title.runs[0].text,
                        subtitle: subtitle === null || subtitle === void 0 ? void 0 : subtitle.simpleText,
                        items: shelfItems,
                    });
                }
                else {
                    // Handler for pageHeader
                    if (rawShelf.type !== "ReelShelf")
                        continue;
                    var title = rawShelf.title, items = rawShelf.items;
                    var shelfItems = items.map(function (i) {
                        return new VideoCompact({ client: target.client }).load(i);
                    });
                    shelves.push({
                        title: title.text,
                        subtitle: "",
                        items: shelfItems,
                    });
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rawShelves_1_1 && !rawShelves_1_1.done && (_a = rawShelves_1.return)) _a.call(rawShelves_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return shelves;
    };
    return ChannelParser;
}());
export { ChannelParser };

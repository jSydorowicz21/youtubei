"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelParser = void 0;
const common_1 = require("../../common");
const BaseChannel_1 = require("../BaseChannel");
const PlaylistCompact_1 = require("../PlaylistCompact");
const VideoCompact_1 = require("../VideoCompact");
class ChannelParser {
    static loadChannel(target, data) {
        var _a;
        if (data.header && data.header.c4TabbedHeaderRenderer) {
            // Handle c4TabbedHeader format
            const { channelId, title, avatar, subscriberCountText, } = data.header.c4TabbedHeaderRenderer;
            target.id = channelId;
            target.name = title;
            target.thumbnails = new common_1.Thumbnails().load(avatar.thumbnails);
            target.videoCount = 0; // data not available in old format
            target.subscriberCount = subscriberCountText === null || subscriberCountText === void 0 ? void 0 : subscriberCountText.simpleText;
            const { tvBanner, mobileBanner, banner } = data.header.c4TabbedHeaderRenderer;
            target.banner = new common_1.Thumbnails().load((banner === null || banner === void 0 ? void 0 : banner.thumbnails) || []);
            target.tvBanner = new common_1.Thumbnails().load((tvBanner === null || tvBanner === void 0 ? void 0 : tvBanner.thumbnails) || []);
            target.mobileBanner = new common_1.Thumbnails().load((mobileBanner === null || mobileBanner === void 0 ? void 0 : mobileBanner.thumbnails) || []);
        }
        else if (data.header && data.header.pageHeaderRenderer) {
            // Handle pageHeader format
            const { title, image, metadata, banner, } = data.header.pageHeaderRenderer.content.pageHeaderViewModel;
            target.id = metadata.external_id;
            target.name = title.text;
            target.thumbnails = new common_1.Thumbnails().load(image.avatar.image);
            target.videoCount = parseInt(metadata.metadata_rows[1].metadata_parts[1].text.text.split(" ")[0]);
            target.subscriberCount = (_a = metadata.metadata_rows
                .flatMap((row) => row.metadata_parts ? row.metadata_parts : [])
                .find((part) => { var _a; return (_a = part.text.text) === null || _a === void 0 ? void 0 : _a.includes("subscriber"); })) === null || _a === void 0 ? void 0 : _a.text.text;
            if (!target.subscriberCount)
                console.log("Subscriber count not found in metadata:", metadata);
            target.banner = new common_1.Thumbnails().load(banner.image);
            console.log(target);
        }
        target.shelves = ChannelParser.parseShelves(target, data);
        return target;
    }
    static parseShelves(target, data) {
        const shelves = [];
        if (!data.header)
            return shelves;
        const rawShelves = data.header.c4TabbedHeaderRenderer
            ? data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents
            : data.header.content.current_tab.content.contents;
        for (const rawShelf of rawShelves) {
            if (data.header.c4TabbedHeaderRenderer) {
                // Handler for c4TabbedHeaderRenderer
                if (!rawShelf.itemSectionRenderer)
                    continue;
                const shelfRenderer = rawShelf.itemSectionRenderer.contents[0].shelfRenderer;
                if (!shelfRenderer)
                    continue;
                const { title, content, subtitle } = shelfRenderer;
                if (!content.horizontalListRenderer)
                    continue;
                const shelfItems = content.horizontalListRenderer.items.map((i) => {
                    if (i.gridVideoRenderer) {
                        return new VideoCompact_1.VideoCompact({ client: target.client }).load(i.gridVideoRenderer);
                    }
                    if (i.gridPlaylistRenderer) {
                        return new PlaylistCompact_1.PlaylistCompact({ client: target.client }).load(i.gridPlaylistRenderer);
                    }
                    if (i.gridChannelRenderer) {
                        return new BaseChannel_1.BaseChannel({ client: target.client }).load(i.gridChannelRenderer);
                    }
                    return undefined;
                }).filter((i) => i !== undefined);
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
                const { title, items } = rawShelf;
                const shelfItems = items.map((i) => {
                    return new VideoCompact_1.VideoCompact({ client: target.client }).load(i);
                });
                shelves.push({
                    title: title.text,
                    subtitle: "",
                    items: shelfItems,
                });
            }
        }
        return shelves;
    }
}
exports.ChannelParser = ChannelParser;

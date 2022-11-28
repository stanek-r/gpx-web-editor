import {GpxMetaData, GpxPoint, GpxRoute, GpxWaypoint} from './models/gpx.model';
import {MetaData, Point, Route, Track, Waypoint} from 'gpxparser';

export function mapToGpxPoint(point: Point): GpxPoint {
  return { ele: point.ele, lat: point.lat, lon: point.lon, time: point.time };
}

export function mapToGpxWaypoint(point: Waypoint): GpxWaypoint {
  return { ...mapToGpxPoint(point), name: point.name, cmt: point.cmt, desc: point.desc};
}

export function mapToGpxTrackOrRoute(trackOrRoute: Track | Route): GpxRoute {
  return {
    name: trackOrRoute.name ?? null,
    link: trackOrRoute.link ?? null,
    points: trackOrRoute.points.map(p => mapToGpxPoint(p)),
    slopes: trackOrRoute.slopes.map(s => isNaN(s) ? 0 : s),
  };
}

export function mapToGpxMetadata(metadata: MetaData): GpxMetaData {
  return {
    name: metadata.name ?? null,
    link: metadata.link ?? null,
    time: metadata.time ?? null,
    desc: metadata.desc ?? null,
    author: metadata.author ?? null,
  };
}

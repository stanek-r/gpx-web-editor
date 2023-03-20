import { GpxMetaData, GpxModel, GpxPoint, GpxPointGroup, GpxWaypoint } from './models/gpx.model';
import { MetaData, Point, Route, Track, Waypoint } from 'gpxparser';

export function mapToGpxPoint(point: Point): GpxPoint {
  return { ele: point.ele, lat: point.lat, lon: point.lon, time: point.time };
}

export function mapToGpxWaypoint(point: Waypoint): GpxWaypoint {
  return {
    ...mapToGpxPoint(point),
    name: point.name,
    cmt: point.cmt,
    desc: point.desc,
  };
}

export function mapToGpxTrackOrRoute<T>(trackOrRoute: Track | Route | undefined): GpxPointGroup {
  const ret = {
    name: trackOrRoute?.name ?? null,
    link: trackOrRoute?.link ?? null,
    points: trackOrRoute?.points.map((p) => mapToGpxPoint(p)),
  } as GpxPointGroup;

  if (trackOrRoute?.slopes) {
    ret.slopes = trackOrRoute?.slopes.map((s) => (isFinite(s) ? s : 0));
  }
  return ret;
}

export function mapToGpxMetadata(metadata: MetaData): GpxMetaData {
  return {
    name: metadata.name ?? null,
    link: metadata.link ?? null,
    time: new Date(),
    desc: metadata.desc ?? null,
    author: metadata.author ?? null,
  };
}

export function mapToGpxPointExport(point: GpxPoint): any {
  const ret = {
    '@': {
      lat: point.lat,
      lon: point.lon,
    },
  } as any;

  if (point.time) {
    ret.time = point.time;
  }
  if (point.ele) {
    ret.ele = point.ele;
  }

  return ret;
}

export function mapToGpxTrack(track: GpxPointGroup): any {
  const ret = {
    name: track.name ?? Math.floor(Math.random() * 1000),
    desc: track.desc ?? '',
    trkseg: {
      trkpt: track.points.map((point) => mapToGpxPointExport(point)),
    },
  } as any;

  if (track.distance) {
    ret.distance = track.distance;
  }

  return ret;
}

export function mapToGpxRoute(route: GpxPointGroup): any {
  const ret = {
    name: route.name ?? Math.floor(Math.random() * 1000),
    desc: route.desc ?? '',
    rtept: route.points.map((point) => mapToGpxPointExport(point)),
  } as any;

  if (route.distance) {
    ret.distance = route.distance;
  }

  return ret;
}

export function mapToGpxExport(data: GpxModel): any {
  return {
    '@': {
      version: '1.1',
      creator: 'gpx-web-editor',
    },
    metadata: {
      name: data.metadata.name,
      desc: data.metadata.desc ?? '',
      link: 'https://gpx-web-editor.web.app/',
      author: {
        name: 'gpx-web-editor',
        link: 'https://gpx-web-editor.web.app/',
      },
      time: new Date(),
    },
    wpt: data.waypoints.map((point) => ({
      ...mapToGpxPointExport(point),
      name: point.name ?? '',
      desc: point.desc ?? '',
    })),
    trk: data.tracks.map((track) => mapToGpxTrack(track)),
    rte: data.routes.map((route) => mapToGpxRoute(route)),
  };
}

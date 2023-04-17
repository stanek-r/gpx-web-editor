import { combineGpxFiles, mapToGpxTrackOrRoute, mapToGpxWaypoint } from './gpx.mapper';
import { GpxModel } from './models/gpx.model';
import { Track, Waypoint } from 'gpxparser';

describe('Mapping of gpx elements', () => {
  it('should map GPX waypoint correctly', () => {
    const now = new Date();
    const point: Waypoint = {
      lat: 1,
      lon: 2,
      ele: 3,
      time: now,
      name: 'Name',
      cmt: 'Comment',
      desc: 'Description',
    };
    const result = mapToGpxWaypoint(point);
    expect(result.lat).toEqual(1);
    expect(result.lon).toEqual(2);
    expect(result.ele).toEqual(3);
    expect(result.time.toISOString()).toEqual(now.toISOString());
    expect(result.name).toEqual('Name');
    expect(result.cmt).toEqual('Comment');
    expect(result.desc).toEqual('Description');
  });

  it('should map GPX track correctly', () => {
    const track: Track = {
      name: 'Name',
      link: {
        href: 'example.com',
        text: 'Example',
        type: 'text/html',
      },
      points: [],
      slopes: [],
      cmt: 'Comment',
      desc: 'Description',
      type: 'Type',
      src: 'Source',
      number: '1',
      distance: {
        total: 1,
        cumul: 2,
      },
      elevation: {
        min: 1,
        max: 2,
        neg: 3,
        pos: 4,
        avg: 5,
      },
    };

    const result = mapToGpxTrackOrRoute(track);
    expect(result.name).toEqual('Name');
    expect(result.points).toEqual([]);
    expect(result.slopes).toEqual([]);
    expect(result.cmt).toEqual('Comment');
    expect(result.desc).toEqual('Description');
    expect(result.type).toEqual('Type');
    expect(result.src).toEqual('Source');
    expect(result.number).toEqual('1');
    expect(result.distance?.total).toEqual(1);
    expect(result.distance?.cumul).toEqual(2);
    expect(result.elevation?.min).toEqual(1);
    expect(result.elevation?.max).toEqual(2);
    expect(result.elevation?.neg).toEqual(3);
    expect(result.elevation?.pos).toEqual(4);
    expect(result.elevation?.avg).toEqual(5);
  });

  it('should combine two files correctly', () => {
    const file1: GpxModel = {
      metadata: {
        name: 'file1',
        time: new Date(),
        author: 1,
        desc: '',
        link: '',
      },
      routes: [
        {
          name: '1',
          points: [
            {
              lat: 1,
              lon: 2,
              ele: 10,
              time: new Date(),
            },
            {
              lat: 2,
              lon: 3,
              ele: 20,
              time: new Date(),
            },
          ],
        },
        {
          name: '2',
          points: [
            {
              lat: 3,
              lon: 4,
              ele: 30,
              time: new Date(),
            },
            {
              lat: 4,
              lon: 5,
              ele: 40,
              time: new Date(),
            },
          ],
        },
      ],
      tracks: [],
      waypoints: [],
      permissionData: {},
    };
    const file2: GpxModel = {
      metadata: {
        name: 'file2',
        time: new Date(),
        author: 1,
        desc: '',
        link: '',
      },
      routes: [
        {
          name: '3',
          points: [
            {
              lat: 5,
              lon: 6,
              ele: 50,
              time: new Date(),
            },
            {
              lat: 6,
              lon: 7,
              ele: 60,
              time: new Date(),
            },
          ],
        },
        {
          name: '4',
          points: [
            {
              lat: 7,
              lon: 8,
              ele: 70,
              time: new Date(),
            },
            {
              lat: 8,
              lon: 9,
              ele: 80,
              time: new Date(),
            },
          ],
        },
      ],
      tracks: [],
      waypoints: [],
      permissionData: {},
    };
    const gpx = combineGpxFiles(file1, file2);
    expect(gpx.routes[0].name).toEqual('1');
    expect(gpx.routes[1].name).toEqual('2');
    expect(gpx.routes[2].name).toEqual('3');
    expect(gpx.routes[3].name).toEqual('4');
  });
});

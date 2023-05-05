import { mapToGpxExport } from '../shared/gpx.mapper';
import { parse } from 'js2xmlparser';
import { GpxModel } from '../shared/models/gpx.model';
import gpxParser from 'gpxparser';

describe('Export of GPX javascript objects to xml', () => {
  it('should map GPX file with waypoints correctly', () => {
    const file: GpxModel = {
      metadata: {
        name: 'Test file',
        time: new Date(),
        author: 1,
        desc: 'This is just a test file',
        link: '',
      },
      routes: [],
      tracks: [],
      waypoints: [
        {
          name: 'Test waypoint',
          lat: 1,
          lon: 2,
          ele: 10,
          time: new Date(),
        },
        {
          name: 'Test waypoint 2',
          lat: 20,
          lon: 30,
          ele: 40,
          time: new Date(),
        },
      ],
      permissionData: {},
    };

    const exportedFileString = parse('gpx', mapToGpxExport(file));

    const gpx = new gpxParser();
    gpx.parse(exportedFileString);

    expect(gpx.metadata.name).toBe('Test file');
    expect(gpx.metadata.desc).toBe('This is just a test file');
    expect(gpx.waypoints.length).toBe(2);
    expect(gpx.waypoints[0].name).toBe('Test waypoint');
    expect(gpx.waypoints[0].lat).toBe(1);
    expect(gpx.waypoints[0].lon).toBe(2);
    expect(gpx.waypoints[0].ele).toBe(10);
    expect(gpx.waypoints[1].name).toBe('Test waypoint 2');
    expect(gpx.waypoints[1].lat).toBe(20);
    expect(gpx.waypoints[1].lon).toBe(30);
    expect(gpx.waypoints[1].ele).toBe(40);
  });

  it('should map GPX file with tracks correctly', () => {
    const file: GpxModel = {
      metadata: {
        name: 'Test file',
        time: new Date(),
        author: 1,
        desc: 'This is just a test file',
        link: '',
      },
      routes: [],
      tracks: [
        {
          name: 'Test track 1',
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
          name: 'Test track 2',
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
      waypoints: [],
      permissionData: {},
    };
    const exportedFileString = parse('gpx', mapToGpxExport(file));
    const gpx = new gpxParser();
    gpx.parse(exportedFileString);
    expect(gpx.metadata.name).toBe('Test file');
    expect(gpx.metadata.desc).toBe('This is just a test file');

    expect(gpx.tracks.length).toBe(2);
    expect(gpx.tracks[0].name).toBe('Test track 1');
    expect(gpx.tracks[0].points.length).toBe(2);
    expect(gpx.tracks[0].points[0].lat).toBe(1);
    expect(gpx.tracks[0].points[0].lon).toBe(2);
    expect(gpx.tracks[0].points[0].ele).toBe(10);
    expect(gpx.tracks[0].points[1].lat).toBe(2);
    expect(gpx.tracks[0].points[1].lon).toBe(3);
    expect(gpx.tracks[0].points[1].ele).toBe(20);
    expect(gpx.tracks[1].name).toBe('Test track 2');
    expect(gpx.tracks[1].points.length).toBe(2);
    expect(gpx.tracks[1].points[0].lat).toBe(3);
    expect(gpx.tracks[1].points[0].lon).toBe(4);
    expect(gpx.tracks[1].points[0].ele).toBe(30);
    expect(gpx.tracks[1].points[1].lat).toBe(4);
    expect(gpx.tracks[1].points[1].lon).toBe(5);
    expect(gpx.tracks[1].points[1].ele).toBe(40);
  });

  it('should map GPX file with routes correctly', () => {
    const file: GpxModel = {
      metadata: {
        name: 'Test file',
        time: new Date(),
        author: 1,
        desc: 'This is just a test file',
        link: '',
      },
      routes: [
        {
          name: 'Test track 1',
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
          name: 'Test track 2',
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
    const exportedFileString = parse('gpx', mapToGpxExport(file));
    const gpx = new gpxParser();
    gpx.parse(exportedFileString);
    expect(gpx.metadata.name).toBe('Test file');
    expect(gpx.metadata.desc).toBe('This is just a test file');

    expect(gpx.routes.length).toBe(2);
    expect(gpx.routes[0].name).toBe('Test track 1');
    expect(gpx.routes[0].points.length).toBe(2);
    expect(gpx.routes[0].points[0].lat).toBe(1);
    expect(gpx.routes[0].points[0].lon).toBe(2);
    expect(gpx.routes[0].points[0].ele).toBe(10);
    expect(gpx.routes[0].points[1].lat).toBe(2);
    expect(gpx.routes[0].points[1].lon).toBe(3);
    expect(gpx.routes[0].points[1].ele).toBe(20);
    expect(gpx.routes[1].name).toBe('Test track 2');
    expect(gpx.routes[1].points.length).toBe(2);
    expect(gpx.routes[1].points[0].lat).toBe(3);
    expect(gpx.routes[1].points[0].lon).toBe(4);
    expect(gpx.routes[1].points[0].ele).toBe(30);
    expect(gpx.routes[1].points[1].lat).toBe(4);
    expect(gpx.routes[1].points[1].lon).toBe(5);
    expect(gpx.routes[1].points[1].ele).toBe(40);
  });
});

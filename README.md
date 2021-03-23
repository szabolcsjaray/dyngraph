# dyngraph

Simple node simulation: attraction and repulsion.

The grouping of the nodes peaked my interest. For this reason, simple controls have been added to help study this phenomenon.

## Ideas to go on

1. seeding random:
      * Unfortunately, Math.random() cannot be seeded by users. Alternative algorithm needs to be adopted.
      * One such: https://github.com/davidbau/seedrandom
2. physics parameters tweak (attraction, repulsion)
      * Parameters are on slides, not really physics looking, though
4. node size/shape
      * size: OK, shape: still to go
5. input from file (node + edge list, or edge list only)
     * textarea input has been added as an easy start 
6. adding graph layout algorithms (or additional physics rules)
     * some have been added, some more can still be good
7. save and restore settings:
     * work in progress. need to finish

## Limitations ##

1. Works well with Chromium engine only.
     * More or less works with FF engine too, but layout of controls fall apart
     * and button inactivation is unreliable

![heptagon with traces on](https://github.com/tiborh/dyngraph/blob/master/img/heptagon_trace.png?raw=true)

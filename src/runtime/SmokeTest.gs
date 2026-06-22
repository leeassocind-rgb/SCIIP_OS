function sciipSmokeTest() {

  const candidate =
    sciipCreateAssetCandidate({
      address: '1234 Test Street',
      city: 'Carson',
      zip: '90745',
      source: 'SMOKE_TEST'
    });

  const asset =
    sciipCreateAssetFromCandidate(
      candidate
    );

  sciipRegisterAsset(
    asset
  );

  sciipBuildAssetGraph(
    asset
  );

  Logger.log(asset);

  return asset;
}
using System.Collections.Generic;
using Pandora.Definitions.Interfaces;

namespace Pandora.Definitions.ResourceManager.EventHub.v2017_04_01.DisasterRecoveryConfigs
{
    internal class Definition : ApiDefinition
    {
        // Generated from Swagger revision "ce90f9b45945c73b8f38649ee6ead390ff6efe7b" 

        public string ApiVersion => "2017-04-01";
        public string Name => "DisasterRecoveryConfigs";
        public IEnumerable<Interfaces.ApiOperation> Operations => new List<Interfaces.ApiOperation>
        {
            new BreakPairingOperation(),
            new CreateOrUpdateOperation(),
            new DeleteOperation(),
            new FailOverOperation(),
            new GetOperation(),
            new ListOperation(),
        };
    }
}

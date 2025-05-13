import { JsonValue } from 'type-fest'
import { defaultEtcConfigFile, selectPrefixedSettings, loadModuleConfig, ConfigSources, createConfiguration } from '@tscool/plugincfg'
import { ArrayAtLeastOneElement, once } from '@tscool/tsutils'
import {
    createSafeDispatcher, EventDispatcher, EventDispatchResult,
    EventDispatchStrategyCallback, Event,
} from '@tscool/events'
import { getCurrentStackFrames } from '@tscool/errors'
import { Logger } from './logger'
import { LevelNumToName, LoggingApi, logLevelIds, logLevelNames, LogLevelNames, LogRecordEnvelope, verbosity } from './types'
import { jsonListener, prettyListener } from './listeners'

export const getConfiguration = once(() => {
    const moduleName = 'logroller'
    const env = selectPrefixedSettings(moduleName, process.env)
    const pjConfig = loadModuleConfig<Record<string, string>>((json: any) => json.scripts, 'package.json')
    const etcFile = defaultEtcConfigFile('logroller')
    const rawConfig = etcFile ? loadModuleConfig(x => x, etcFile) : {}
    const jsonConfig = {
        rawConfig,
        pjConfig,
    } as Record<string, JsonValue>
    const cs: ConfigSources = {
        env, jsonConfig
    }
    const listeners = 'listeners' as const
    return createConfiguration(cs)
        .addUnion<'logLevel', LogLevelNames>('logLevel', 'info',
            ...logLevelNames)
        .addArray<typeof listeners, ArrayAtLeastOneElement<string>>(listeners, ['json'])
        .build()
})

export const getDefaultListeners = once((): ((e: Event<LogRecordEnvelope>) => unknown)[] => {
    const cfg = getConfiguration()
    const res = cfg.listeners
        .map(name => {
            switch(name) {
                case 'json':
                    return jsonListener
                case 'pretty':
                    return prettyListener
            }
        })
        .filter(listener => listener)
    return res as ((e: Event<LogRecordEnvelope>) => unknown)[]
})

export const _defaultLoggingEventSource = new EventDispatcher<LogRecordEnvelope, unknown>
const _dispatcher: EventDispatchStrategyCallback<LogRecordEnvelope, unknown> = createSafeDispatcher(
    _defaultLoggingEventSource,
    async (edisp, logrec): Promise<EventDispatchResult<unknown>> => {
        return edisp.emitSync(logrec)
    }
)

function _makeLevelLogger(level: LogLevelNames, module: string): Logger {
    const logger = new Logger(level, _dispatcher, { module })
    getDefaultListeners()
        .map((listener) => logger.dispatcher.dispatcher.registerSync(0, listener))
    return logger
}

function _getDefaultCallingModule(): string {
    const fn = getCurrentStackFrames()?.[2]?.file
    return fn || '*anonymous-module*'
}

export function makeModuleLog(module?: string): LoggingApi
{
    const cfg = getConfiguration()
    const levelName = cfg.logLevel
    const levelId = verbosity[levelName]
    const levelsSupported = logLevelIds
        .filter(lid => lid <= levelId)
        .map(lid => LevelNumToName.get(lid))
    const moduleUsed = module || _getDefaultCallingModule()
    return Object.assign({}, ...levelsSupported
        .map((levelName) => ({
            [levelName as string]: _makeLevelLogger(levelName as LogLevelNames, moduleUsed)
        }))
    )
}

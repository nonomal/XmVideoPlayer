import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { PlayHistory } from '@/internal/repository/model';
import { XM_DB, XM_TABLE } from '@/internal/repository/model';
import { historyListDefault } from './config';

export class DexieDb extends Dexie {
  protected static client: DexieDb;
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  [XM_TABLE.PLAY_HISTORY_TABLE]!: Table<PlayHistory>;
  private constructor() {
    if (DexieDb.client) {
      const error = new Error('Error - Please use DbClient.create() create DbClient instance');
      error.cause = 'build_class_instance';
      throw error;
    }
    super(XM_DB['PLAYER_DB']);
    this._build();
  }

  private _build() {
    this.version(2)
      .stores({
        [XM_TABLE.PLAY_HISTORY_TABLE]: '++id, name, &url, created_at, updated_at', // Primary key and indexed props
      })
      .upgrade((trans) => {
        // 升级时候触发，初始化不会触发
        console.info(`IDB正在升级至version:%c${this.verno}...`, 'color: green');
        return trans
          .table<PlayHistory>(XM_TABLE.PLAY_HISTORY_TABLE)
          .toCollection()
          .modify((t) => {
            t.created_at = new Date().toISOString(); // 为所有现有的记录设置默认值
          });
      });
    // https://dexie.org/docs/Dexie/Dexie.on.populate
    // http://www.javashuo.com/article/p-qmqrgdsu-ea.html
    // The populate Event（初始化事件）
    // If database is not present, or an earlier version was present, indexedDB’s onupgradeneeded event is fired and taken care of by Dexie.
    // （若是数据库不存在或传入更高版本号，indexedDB的 onupgradeneeded事件将被触发）
    // IndexedDB is designed for handling database creation and upgrades through the onupgradeneeded event, and define the schema there.
    // （indexeddb设计用于经过onupgradeneeded 事件处理数据库建立和升级，并在其中定义模式。）
    // Dexie adds a declarative schema syntax on top of that so that you don’t need to subscribe to the onupgradeneeded event either.
    // （Dexie添加了一个声明性模式语法，这样您也不须要订阅onupgradened事件。）
    // The database schema is declarative, not imperative.（
    // 数据库表架构是声明性的，不是必需的。能够在打开数据库后再建立？）
    // In case your database need initial data in order to work - data that must only be populated on database creation and never more, you can subscribe to the populate event.
    //  （若是要在数据库创建时初始化数据可使用 populate 事件）
    // This will only be called in case the database is initially created - not when it is upgraded.
    // （populate 事件只在创建数据库时调用，更新时不调用）
    this.on('populate', (trans) => {
      console.log('-------IDB初始化--------:', this.verno);
      return trans.table<Omit<PlayHistory, 'id'>>(XM_TABLE.PLAY_HISTORY_TABLE).bulkAdd(
        historyListDefault.map((item) => ({
          ...item,
          created_at: new Date().toISOString(),
        }))
      );
    });
  }

  public static create() {
    if (!DexieDb.client) {
      DexieDb.client = new DexieDb();
    }
    return DexieDb.client;
  }

  public static singleton() {
    if (!DexieDb.client) {
      const error = new Error('Error - Please use DbClient.create() create DbClient instance');
      error.cause = 'build_class_instance';
      throw error;
    }
    return DexieDb.client;
  }
}

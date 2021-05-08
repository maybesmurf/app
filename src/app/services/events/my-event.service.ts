import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserTypes } from 'src/app/types/entity-types';
import { ChannelService } from '../channel.service';
import { GuildService } from '../guild.service';
import { PingService } from '../ping.service';
import { UserService } from '../user.service';
import { Args } from '../ws.service';

@Injectable({
  providedIn: 'root'
})
export class MyEventService {
  constructor(
    private channelService: ChannelService,
    private guildService: GuildService,
    private pings: PingService,
    private router: Router,
    private userService: UserService,
  ) {}

  public async addFriend({ sender, friend, dmChannel }: Args.AddFriend) {
    this.updateFriends({ sender, friend });
    if (dmChannel)
      this.channelService.add(dmChannel);
  }
  public updateFriends({ sender, friend }: Args.RemoveFriend) {
    this.userService.upsert(sender._id, sender);    
    this.userService.upsert(friend._id, friend);
  }

  public async joinGuild({ guild }: Args.GuildJoin) {
    await this.userService.fetchAll();
    this.guildService.add(guild);

    await this.router.navigate([`/channels/${guild._id}`]);
  }

  public updatePresence({ userId, status }: Args.PresenceUpdate) {
    this.userService.upsert(userId, { status });
  }

  public async updateUser({ partialUser }: Args.UserUpdate) {
    const user = this.userService.self;
    this.userService.upsert(user._id, partialUser);

    if ('lastReadMessages' in partialUser)
      await this.updateReadMessages(partialUser);
  }

  private async updateReadMessages(partialUser: Partial<UserTypes.Self>) {
    for (const channelId in partialUser.lastReadMessages) {
      const channel = await this.channelService.getAsync(channelId);
      const messageId = partialUser.lastReadMessages[channelId];

      if (channel?.lastMessageId === messageId)
        this.pings.markAsRead(channelId);
    }
  }
}

#include <linux/bpf.h>
#include <linux/in.h>
#include <linux/if_ether.h>
#include <linux/ip.h>

#define SEC(NAME) __attribute__((section(NAME), used))

/*
 * MANI$OFT CORE OS // eBPF XDP LINE-RATE DDOS SHIELD
 * Runs at raw driver layer (XDP_DROP / XDP_PASS)
 */

SEC("xdp_drop")
int xdp_ddos_filter(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;

    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;

    if (eth->h_proto != 0x0800) /* ETH_P_IP */
        return XDP_PASS;

    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end)
        return XDP_PASS;

    /* Drop malformed TCP header packets at line rate */
    if (ip->protocol == 6 /* IPPROTO_TCP */ && ip->ihl < 5) {
        return XDP_DROP;
    }

    return XDP_PASS;
}

char _license[] SEC("license") = "GPL";
